
import express from "express";

import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deactivateDoctor,
} from "../controllers/doctorController.js";

import {
  verifyToken,
  checkRole,
} from "../middleware/authMiddleware.js";

const doctorRouter = express.Router();

// Create doctor - Admin only
doctorRouter.post(
  "/",
  verifyToken,
  checkRole("ADMIN"),
  createDoctor
);

// Get all doctors
doctorRouter.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getAllDoctors
);

// Get doctor by ID
doctorRouter.get(
  "/:doctorId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getDoctorById
);

// Update doctor - Admin only
doctorRouter.put(
  "/:doctorId",
  verifyToken,
  checkRole("ADMIN"),
  updateDoctor
);

// Deactivate doctor - Admin only
doctorRouter.delete(
  "/:doctorId",
  verifyToken,
  checkRole("ADMIN"),
  deactivateDoctor
);

export default doctorRouter;
