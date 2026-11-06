import prisma from "../lib/prisma.js";

// Create Patient
export async function createPatient(req, res) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      email,
      address,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone,
        email,
        address,
      },
    });

    return res.status(201).json({
      message: "Patient created successfully",
      patient,
    });

  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAllPatients(req, res) {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getPatientById(req, res) {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        isActive: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      patient,
    });
  } catch (error) {
    console.error("Get patient error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updatePatient(req, res) {
  try {
    const { patientId } = req.params;
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      email,
      address,
    } = req.body;

    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        isActive: true,
      },
    });

    if (!existingPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const patient = await prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : undefined,
        phone,
        email,
        address,
      },
    });

    return res.status(200).json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deactivatePatient(req, res) {
  try {
    const { patientId } = req.params;

    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        isActive: true,
      },
    });

    if (!existingPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const patient = await prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "Patient delete successfully",
      patient,
    });
  } catch (error) {
    console.error("Deactivate patient error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}