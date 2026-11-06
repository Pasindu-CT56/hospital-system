
import express from "express";

import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} from "../controllers/appointmentController.js";

import {
  verifyToken,
  checkRole,
} from "../middleware/authMiddleware.js";

const appointmentRouter = express.Router();

// Create Appointment
appointmentRouter.post(
  "/",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  createAppointment
);

// Get All Appointments
appointmentRouter.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getAllAppointments
);

// Get Appointment By ID
appointmentRouter.get(
  "/:appointmentId",
  verifyToken,
  checkRole("ADMIN", "DOCTOR", "RECEPTIONIST"),
  getAppointmentById
);

// Update Appointment
appointmentRouter.put(
  "/:appointmentId",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  updateAppointment
);

// Cancel Appointment
appointmentRouter.patch(
  "/:appointmentId/cancel",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  cancelAppointment
);

export default appointmentRouter;
