import prisma from "../lib/prisma.js";

// Validate UUID
function isValidUUID(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  );
}

// Validate optional text fields
function validateOptionalText(value) {
  if (value === undefined || value === null) {
    return { valid: true, value: value ?? null };
  }

  if (typeof value !== "string") {
    return { valid: false };
  }

  return {
    valid: true,
    value: value.trim() || null,
  };
}

// CREATE MEDICAL RECORD
export async function createMedicalRecord(req, res) {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      treatment,
      prescription,
      notes,
      recordDate,
    } = req.body;

    // Validate required fields
    if (
      !patientId ||
      typeof diagnosis !== "string" ||
      !diagnosis.trim()
    ) {
      return res.status(400).json({
        message: "Patient ID and diagnosis are required",
      });
    }

    // Validate IDs
    if (!isValidUUID(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    if (appointmentId && !isValidUUID(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    // Validate optional text fields
    const treatmentData = validateOptionalText(treatment);
    const prescriptionData = validateOptionalText(prescription);
    const notesData = validateOptionalText(notes);

    if (
      !treatmentData.valid ||
      !prescriptionData.valid ||
      !notesData.valid
    ) {
      return res.status(400).json({
        message: "Treatment, prescription and notes must be text values",
      });
    }

    // Get the logged-in doctor's profile
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { isActive: true },
        },
      },
    });

    if (!doctor || !doctor.user.isActive) {
      return res.status(403).json({
        message: "Active doctor profile not found",
      });
    }

    // Check whether patient exists and is active
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        isActive: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Active patient not found",
      });
    }

    // Validate optional appointment
    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId,
          doctorId: doctor.id,
        },
      });

      if (!appointment) {
        return res.status(400).json({
          message: "Appointment does not match this patient and doctor",
        });
      }

      if (appointment.status === "CANCELLED") {
        return res.status(400).json({
          message:
            "Cannot create a medical record for a cancelled appointment",
        });
      }

      // Check for an existing medical record
      const existingRecord = await prisma.medicalRecord.findUnique({
        where: { appointmentId },
      });

      if (existingRecord) {
        return res.status(409).json({
          message: "A medical record already exists for this appointment",
        });
      }
    }

    // Validate record date
    let parsedRecordDate;

    if (recordDate !== undefined) {
      if (typeof recordDate !== "string" || !recordDate.trim()) {
        return res.status(400).json({
          message: "Invalid record date",
        });
      }

      parsedRecordDate = new Date(recordDate);

      if (Number.isNaN(parsedRecordDate.getTime())) {
        return res.status(400).json({
          message: "Invalid record date",
        });
      }

      if (parsedRecordDate > new Date()) {
        return res.status(400).json({
          message: "Record date cannot be in the future",
        });
      }
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId: doctor.id,
        appointmentId: appointmentId || null,
        diagnosis: diagnosis.trim(),
        treatment: treatmentData.value,
        prescription: prescriptionData.value,
        notes: notesData.value,
        ...(parsedRecordDate && {
          recordDate: parsedRecordDate,
        }),
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        appointment: true,
      },
    });

    return res.status(201).json({
      message: "Medical record created successfully",
      medicalRecord,
    });
  } catch (error) {
    console.error("Create medical record error:", error);

    // Handle duplicate appointment record
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A medical record already exists for this appointment",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET ALL MEDICAL RECORDS
export async function getAllMedicalRecords(req, res) {
  try {
    const where =
      req.user.role === "ADMIN"
        ? {}
        : {
            doctor: {
              userId: req.user.id,
            },
          };

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        appointment: true,
      },
      orderBy: {
        recordDate: "desc",
      },
    });

    return res.status(200).json({
      count: medicalRecords.length,
      medicalRecords,
    });
  } catch (error) {
    console.error("Get medical records error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET MEDICAL RECORD BY ID
export async function getMedicalRecordById(req, res) {
  try {
    const { recordId } = req.params;

    if (!isValidUUID(recordId)) {
      return res.status(400).json({
        message: "Invalid medical record ID",
      });
    }

    const where = {
      id: recordId,
      ...(req.user.role !== "ADMIN" && {
        doctor: {
          userId: req.user.id,
        },
      }),
    };

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where,
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        appointment: true,
      },
    });

    if (!medicalRecord) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    return res.status(200).json({ medicalRecord });
  } catch (error) {
    console.error("Get medical record error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET MEDICAL RECORDS BY PATIENT ID
export async function getMedicalRecordsByPatient(req, res) {
  try {
    const { patientId } = req.params;

    if (!isValidUUID(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const where = {
      patientId,
      ...(req.user.role !== "ADMIN" && {
        doctor: {
          userId: req.user.id,
        },
      }),
    };

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: true,
      },
      orderBy: {
        recordDate: "desc",
      },
    });

    return res.status(200).json({
      count: medicalRecords.length,
      medicalRecords,
    });
  } catch (error) {
    console.error("Get patient medical records error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// UPDATE MEDICAL RECORD
export async function updateMedicalRecord(req, res) {
  try {
    const { recordId } = req.params;
    const { diagnosis, treatment, prescription, notes } = req.body;

    if (!isValidUUID(recordId)) {
      return res.status(400).json({
        message: "Invalid medical record ID",
      });
    }

    // Check whether at least one field was provided
    if (
      diagnosis === undefined &&
      treatment === undefined &&
      prescription === undefined &&
      notes === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    // Validate diagnosis
    if (
      diagnosis !== undefined &&
      (typeof diagnosis !== "string" || !diagnosis.trim())
    ) {
      return res.status(400).json({
        message: "Diagnosis cannot be empty",
      });
    }

    // Validate optional text fields
    const treatmentData = validateOptionalText(treatment);
    const prescriptionData = validateOptionalText(prescription);
    const notesData = validateOptionalText(notes);

    if (
      !treatmentData.valid ||
      !prescriptionData.valid ||
      !notesData.valid
    ) {
      return res.status(400).json({
        message: "Treatment, prescription and notes must be text values",
      });
    }

    // Find record and check doctor ownership
    const where = {
      id: recordId,
      ...(req.user.role !== "ADMIN" && {
        doctor: {
          userId: req.user.id,
        },
      }),
    };

    const existingRecord = await prisma.medicalRecord.findFirst({
      where,
    });

    if (!existingRecord) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        ...(diagnosis !== undefined && {
          diagnosis: diagnosis.trim(),
        }),
        ...(treatment !== undefined && {
          treatment: treatmentData.value,
        }),
        ...(prescription !== undefined && {
          prescription: prescriptionData.value,
        }),
        ...(notes !== undefined && {
          notes: notesData.value,
        }),
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: true,
      },
    });

    return res.status(200).json({
      message: "Medical record updated successfully",
      medicalRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Update medical record error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}