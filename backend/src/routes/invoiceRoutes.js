
import express from "express";

import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByPatient,
  addInvoicePayment,
  getInvoicePayments,
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

// GET PAYMENT HISTORY
invoiceRouter.get(
  "/:invoiceId/payments",
  verifyToken,
  checkRole("ADMIN", "RECEPTIONIST"),
  getInvoicePayments
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
