import express from "express";

import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deactivatePatient,
} from "../controllers/patientController.js";

import {
  verifyToken,
  checkRole,
} from "../middleware/authMiddleware.js";

const patientRouter = express.Router();

// Create Patient
patientRouter.post(
  "/",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  createPatient
);

patientRouter.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getAllPatients
);

patientRouter.get(
  "/:patientId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getPatientById
);

patientRouter.put(
  "/:patientId",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  updatePatient
);

patientRouter.delete(
  "/:patientId",
  verifyToken,
  checkRole("ADMIN"),
  deactivatePatient
);

export default patientRouter;