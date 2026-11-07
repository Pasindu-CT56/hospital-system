
import prisma from "../lib/prisma.js";

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

      // Prevent records for cancelled appointments
      if (appointment.status === "CANCELLED") {
        return res.status(400).json({
          message: "Cannot create a medical record for a cancelled appointment",
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

    if (recordDate) {
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
        treatment: treatment || null,
        prescription: prescription || null,
        notes: notes || null,
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

    if (
      diagnosis !== undefined &&
      (typeof diagnosis !== "string" || !diagnosis.trim())
    ) {
      return res.status(400).json({
        message: "Diagnosis cannot be empty",
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
        ...(treatment !== undefined && { treatment }),
        ...(prescription !== undefined && { prescription }),
        ...(notes !== undefined && { notes }),
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
