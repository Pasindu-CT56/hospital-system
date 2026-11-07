
import express from "express";

import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByPatient,
  addInvoicePayment,
} from "../controllers/invoiceController.js";

import {
  verifyToken,
  checkRole,
} from "../middleware/authMiddleware.js";

const invoiceRouter = express.Router();

// ADMIN and RECEPTIONIST
invoiceRouter.post(
  "/",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  createInvoice
);

invoiceRouter.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  getAllInvoices
);

invoiceRouter.get(
  "/patient/:patientId",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  getInvoicesByPatient
);

invoiceRouter.get(
  "/:invoiceId",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  getInvoiceById
);

invoiceRouter.patch(
  "/:invoiceId/payment",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  addInvoicePayment
);

export default invoiceRouter;
