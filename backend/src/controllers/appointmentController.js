
import prisma from "../lib/prisma.js";

// Validate UUID
function isValidUUID(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

// Validate appointment date
function validateAppointmentDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { valid: false };
  }

  if (date <= new Date()) {
    return { valid: false, pastDate: true };
  }

  return { valid: true, date };
}

// Check doctor appointment conflict
async function hasAppointmentConflict(
  doctorId,
  appointmentDate,
  excludeAppointmentId = null
) {
  const startTime = new Date(appointmentDate);
  const endTime = new Date(
    startTime.getTime() + 30 * 60 * 1000
  );

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
      appointmentDate: {
        gte: new Date(startTime.getTime() - 30 * 60 * 1000),
        lt: endTime,
      },
      ...(excludeAppointmentId && {
        id: {
          not: excludeAppointmentId,
        },
      }),
    },
  });

  return Boolean(existingAppointment);
}

// CREATE APPOINTMENT
export async function createAppointment(req, res) {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      reason,
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({
        message: "Patient, doctor and appointment date are required",
      });
    }

    if (!isValidUUID(patientId) || !isValidUUID(doctorId)) {
      return res.status(400).json({
        message: "Invalid patient or doctor ID",
      });
    }

    const dateValidation = validateAppointmentDate(appointmentDate);

    if (!dateValidation.valid) {
      return res.status(400).json({
        message: dateValidation.pastDate
          ? "Appointment date must be in the future"
          : "Invalid appointment date",
      });
    }

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

    const doctor = await prisma.doctor.findFirst({
      where: {
        id: doctorId,
        user: {
          isActive: true,
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Active doctor not found",
      });
    }

    const conflict = await hasAppointmentConflict(
      doctorId,
      dateValidation.date
    );

    if (conflict) {
      return res.status(409).json({
        message: "Doctor already has an appointment around this time",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: dateValidation.date,
        reason,
      },
    });

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET ALL APPOINTMENTS
export async function getAllAppointments(req, res) {
  try {
    const where =
      req.user.role === "DOCTOR"
        ? {
            doctor: {
              is: {
                userId: req.user.id,
              },
            },
          }
        : {};

    const appointments = await prisma.appointment.findMany({
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
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    return res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET APPOINTMENT BY ID
export async function getAppointmentById(req, res) {
  try {
    const { appointmentId } = req.params;

    if (!isValidUUID(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const where =
      req.user.role === "DOCTOR"
        ? {
            id: appointmentId,
            doctor: {
              is: {
                userId: req.user.id,
              },
            },
          }
        : {
            id: appointmentId,
          };

    const appointment = await prisma.appointment.findFirst({
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
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// UPDATE APPOINTMENT
export async function updateAppointment(req, res) {
  try {
    const { appointmentId } = req.params;

    if (!isValidUUID(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const {
      patientId,
      doctorId,
      appointmentDate,
      reason,
      status,
    } = req.body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (existingAppointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cancelled appointments cannot be updated",
      });
    }

    if (existingAppointment.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed appointments cannot be updated",
      });
    }

    if (patientId !== undefined) {
      if (!isValidUUID(patientId)) {
        return res.status(400).json({
          message: "Invalid patient ID",
        });
      }

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
    }

    if (doctorId !== undefined) {
      if (!isValidUUID(doctorId)) {
        return res.status(400).json({
          message: "Invalid doctor ID",
        });
      }

      const doctor = await prisma.doctor.findFirst({
        where: {
          id: doctorId,
          user: {
            isActive: true,
          },
        },
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Active doctor not found",
        });
      }
    }

    if (
      status !== undefined &&
      !["SCHEDULED", "CONFIRMED", "COMPLETED"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    let date = existingAppointment.appointmentDate;

    if (appointmentDate !== undefined) {
      const dateValidation = validateAppointmentDate(appointmentDate);

      if (!dateValidation.valid) {
        return res.status(400).json({
          message: dateValidation.pastDate
            ? "Appointment date must be in the future"
            : "Invalid appointment date",
        });
      }

      date = dateValidation.date;
    }

    const finalDoctorId = doctorId || existingAppointment.doctorId;
    const scheduleChanged =
      finalDoctorId !== existingAppointment.doctorId ||
      date.getTime() !== existingAppointment.appointmentDate.getTime();

    // Only check conflicts when the doctor or appointment time changes.
    if (scheduleChanged) {
      const conflict = await hasAppointmentConflict(
        finalDoctorId,
        date,
        appointmentId
      );

      if (conflict) {
        return res.status(409).json({
          message: "Doctor already has an appointment around this time",
        });
      }
    }

    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      return res.status(400).json({
        message: "Appointment reason must be a text value",
      });
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        patientId,
        doctorId,
        appointmentDate: date,
        reason,
        status,
      },
    });

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// CANCEL APPOINTMENT
export async function cancelAppointment(req, res) {
  try {
    const { appointmentId } = req.params;

    if (!isValidUUID(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (existingAppointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Appointment is already cancelled",
      });
    }

    if (existingAppointment.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled",
      });
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}