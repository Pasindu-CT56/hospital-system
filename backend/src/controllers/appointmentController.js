
import prisma from "../lib/prisma.js";

// Create Appointment
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

    const date = new Date(appointmentDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
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

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: date,
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

// Get All Appointments
export async function getAllAppointments(req, res) {
  try {
    const appointments = await prisma.appointment.findMany({
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

// Get Appointment By ID
export async function getAppointmentById(req, res) {
  try {
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
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

// Update Appointment
export async function updateAppointment(req, res) {
  try {
    const { appointmentId } = req.params;

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

    if (patientId) {
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

    if (doctorId) {
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
      status &&
      !["SCHEDULED", "CONFIRMED", "COMPLETED"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    let date;

    if (appointmentDate !== undefined) {
      date = new Date(appointmentDate);

      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "Invalid appointment date",
        });
      }
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

// Cancel Appointment
export async function cancelAppointment(req, res) {
  try {
    const { appointmentId } = req.params;

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
