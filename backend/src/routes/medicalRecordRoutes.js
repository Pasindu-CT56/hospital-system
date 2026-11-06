import express from "express";

import {
  createMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecordById,
  getMedicalRecordsByPatient,
  updateMedicalRecord,
} from "../controllers/medicalRecordController.js";

import {
  verifyToken,
  checkRole,
} from "../middleware/authMiddleware.js";

const medicalRecordRouter = express.Router();

// Create medical record - Doctor only
medicalRecordRouter.post(
  "/",
  verifyToken,
  checkRole("DOCTOR"),
  createMedicalRecord
);

// Get all medical records
medicalRecordRouter.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "DOCTOR"),
  getAllMedicalRecords
);

// Get records by patient ID
medicalRecordRouter.get(
  "/patient/:patientId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR"),
  getMedicalRecordsByPatient
);

// Get medical record by ID
medicalRecordRouter.get(
  "/:recordId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR"),
  getMedicalRecordById
);

// Update medical record
medicalRecordRouter.put(
  "/:recordId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR"),
  updateMedicalRecord
);

export default medicalRecordRouter;