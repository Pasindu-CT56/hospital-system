
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// CREATE DOCTOR
export async function createDoctor(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      specialization,
      licenseNumber,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (licenseNumber) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (existingDoctor) {
        return res.status(409).json({
          message: "License number already exists",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: "DOCTOR",
        doctor: {
          create: {
            specialization,
            licenseNumber,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        doctor: true,
      },
    });

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET ALL DOCTORS
export async function getAllDoctors(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET DOCTOR BY ID
export async function getDoctorById(req, res) {
  try {
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findFirst({
      where: {
        id: doctorId,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({ doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// UPDATE DOCTOR
export async function updateDoctor(req, res) {
  try {
    const { doctorId } = req.params;

    const {
      firstName,
      lastName,
      email,
      specialization,
      licenseNumber,
    } = req.body;

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        id: doctorId,
        user: {
          isActive: true,
        },
      },
      include: {
        user: true,
      },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (email && email !== existingDoctor.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    if (
      licenseNumber &&
      licenseNumber !== existingDoctor.licenseNumber
    ) {
      const licenseExists = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (licenseExists) {
        return res.status(409).json({
          message: "License number already exists",
        });
      }
    }

    const updatedDoctor = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: existingDoctor.userId,
        },
        data: {
          firstName,
          lastName,
          email,
        },
      });

      return tx.doctor.update({
        where: {
          id: doctorId,
        },
        data: {
          specialization,
          licenseNumber,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });

    return res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DEACTIVATE DOCTOR
export async function deactivateDoctor(req, res) {
  try {
    const { doctorId } = req.params;

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
        message: "Doctor not found",
      });
    }

    await prisma.user.update({
      where: {
        id: doctor.userId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "Doctor deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate doctor error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
