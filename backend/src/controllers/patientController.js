import prisma from "../lib/prisma.js";

function isValidUUID(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function validateDateOfBirth(value) {
  if (value === null || value === undefined || value === "") {
    return { valid: true, date: null };
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { valid: false };
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { valid: false };
  }

  if (date > new Date()) {
    return { valid: false, futureDate: true };
  }

  return { valid: true, date };
}

function validateOptionalText(value) {
  if (value === undefined) return { valid: true, value: undefined };
  if (value === null) return { valid: true, value: null };
  if (typeof value !== "string") return { valid: false };
  return { valid: true, value: value.trim() || null };
}

// CREATE PATIENT
export async function createPatient(req, res) {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, address } = req.body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const dobValidation = validateDateOfBirth(dateOfBirth);
    const phoneData = validateOptionalText(phone);
    const emailData = validateOptionalText(email);
    const addressData = validateOptionalText(address);

    if (!dobValidation.valid) {
      return res.status(400).json({
        message: dobValidation.futureDate
          ? "Date of birth cannot be in the future"
          : "Invalid date of birth",
      });
    }

    if (!phoneData.valid || !emailData.valid || !addressData.valid) {
      return res.status(400).json({
        message: "Phone, email and address must be text values",
      });
    }

    if (
      emailData.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.value)
    ) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const patient = await prisma.patient.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dobValidation.date,
        phone: phoneData.value,
        email: emailData.value?.toLowerCase() ?? null,
        address: addressData.value,
      },
    });

    return res.status(201).json({
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create patient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET ALL ACTIVE PATIENTS
export async function getAllPatients(req, res) {
  try {
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ patients });
  } catch (error) {
    console.error("Get patients error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET PATIENT BY ID
export async function getPatientById(req, res) {
  try {
    const { patientId } = req.params;

    if (!isValidUUID(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, isActive: true },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ patient });
  } catch (error) {
    console.error("Get patient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE PATIENT
export async function updatePatient(req, res) {
  try {
    const { patientId } = req.params;

    if (!isValidUUID(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const existingPatient = await prisma.patient.findFirst({
      where: { id: patientId, isActive: true },
    });

    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const data = {};
    const { firstName, lastName, dateOfBirth, phone, email, address } = req.body;

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        return res.status(400).json({ message: "First name cannot be empty" });
      }
      data.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        return res.status(400).json({ message: "Last name cannot be empty" });
      }
      data.lastName = lastName.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "dateOfBirth")) {
      const dobValidation = validateDateOfBirth(dateOfBirth);
      if (!dobValidation.valid) {
        return res.status(400).json({
          message: dobValidation.futureDate
            ? "Date of birth cannot be in the future"
            : "Invalid date of birth",
        });
      }
      data.dateOfBirth = dobValidation.date;
    }

    for (const [field, value] of Object.entries({ phone, email, address })) {
      if (value !== undefined) {
        const result = validateOptionalText(value);
        if (!result.valid) {
          return res.status(400).json({
            message: "Phone, email and address must be text values",
          });
        }
        data[field] = field === "email" && result.value
          ? result.value.toLowerCase()
          : result.value;
      }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "At least one field is required to update" });
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data,
    });

    return res.status(200).json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DEACTIVATE PATIENT (DO NOT PERMANENTLY DELETE MEDICAL HISTORY)
export async function deactivatePatient(req, res) {
  try {
    const { patientId } = req.params;

    if (!isValidUUID(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const existingPatient = await prisma.patient.findFirst({
      where: { id: patientId, isActive: true },
    });

    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });

    return res.status(200).json({
      message: "Patient deactivated successfully",
      patient,
    });
  } catch (error) {
    console.error("Deactivate patient error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}