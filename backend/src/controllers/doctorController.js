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

    // Validate required fields
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSpecialization =
      typeof specialization === "string"
        ? specialization.trim() || null
        : null;
    const normalizedLicenseNumber =
      typeof licenseNumber === "string"
        ? licenseNumber.trim() || null
        : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Check existing license number
    if (normalizedLicenseNumber) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: {
          licenseNumber: normalizedLicenseNumber,
        },
      });

      if (existingDoctor) {
        return res.status(409).json({
          message: "License number already exists",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and doctor together
    const doctor = await prisma.user.create({
      data: {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        passwordHash,
        role: "DOCTOR",
        doctor: {
          create: {
            specialization: normalizedSpecialization,
            licenseNumber: normalizedLicenseNumber,
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

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email or license number already exists",
      });
    }

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

    return res.status(200).json({
      doctor,
    });
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

    const userData = {};
    const doctorData = {};

    // Validate and prepare first name
    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        return res.status(400).json({
          message: "First name cannot be empty",
        });
      }

      userData.firstName = firstName.trim();
    }

    // Validate and prepare last name
    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        return res.status(400).json({
          message: "Last name cannot be empty",
        });
      }

      userData.lastName = lastName.trim();
    }

    // Validate and prepare email
    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      if (normalizedEmail !== existingDoctor.user.email) {
        const emailExists = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        if (emailExists) {
          return res.status(409).json({
            message: "Email already exists",
          });
        }
      }

      userData.email = normalizedEmail;
    }

    // Validate and prepare specialization
    if (specialization !== undefined) {
      if (
        specialization !== null &&
        typeof specialization !== "string"
      ) {
        return res.status(400).json({
          message: "Invalid specialization",
        });
      }

      doctorData.specialization =
        typeof specialization === "string"
          ? specialization.trim() || null
          : null;
    }

    // Validate and prepare license number
    if (licenseNumber !== undefined) {
      if (
        licenseNumber !== null &&
        typeof licenseNumber !== "string"
      ) {
        return res.status(400).json({
          message: "Invalid license number",
        });
      }

      const normalizedLicenseNumber =
        typeof licenseNumber === "string"
          ? licenseNumber.trim() || null
          : null;

      if (
        normalizedLicenseNumber &&
        normalizedLicenseNumber !== existingDoctor.licenseNumber
      ) {
        const licenseExists = await prisma.doctor.findUnique({
          where: {
            licenseNumber: normalizedLicenseNumber,
          },
        });

        if (licenseExists) {
          return res.status(409).json({
            message: "License number already exists",
          });
        }
      }

      doctorData.licenseNumber = normalizedLicenseNumber;
    }

    if (
      Object.keys(userData).length === 0 &&
      Object.keys(doctorData).length === 0
    ) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // Update user and doctor together
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: {
            id: existingDoctor.userId,
          },
          data: userData,
        });
      }

      return tx.doctor.update({
        where: {
          id: doctorId,
        },
        data: doctorData,
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

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email or license number already exists",
      });
    }

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