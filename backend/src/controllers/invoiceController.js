
import prisma from "../lib/prisma.js";

// CREATE INVOICE
export async function createInvoice(req, res) {
  try {
    const { patientId, appointmentId, totalAmount, paidAmount = 0 } =
      req.body;

    if (!patientId || !appointmentId || totalAmount === undefined) {
      return res.status(400).json({
        message: "Patient ID, appointment ID and total amount are required",
      });
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount);

    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than zero",
      });
    }

    if (!Number.isFinite(paid) || paid < 0) {
      return res.status(400).json({
        message: "Paid amount cannot be negative or invalid",
      });
    }

    if (paid > total) {
      return res.status(400).json({
        message: "Paid amount cannot exceed total amount",
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.isActive) {
      return res.status(404).json({
        message: "Active patient not found",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.patientId !== patientId) {
      return res.status(400).json({
        message: "Appointment does not belong to this patient",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot create an invoice for a cancelled appointment",
      });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { appointmentId },
    });

    if (existingInvoice) {
      return res.status(409).json({
        message: "An invoice already exists for this appointment",
      });
    }

    const status =
      paid === 0
        ? "PENDING"
        : paid === total
          ? "PAID"
          : "PARTIALLY_PAID";

    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        appointmentId,
        totalAmount: total.toFixed(2),
        paidAmount: paid.toFixed(2),
        status,
        payments:
          paid > 0
            ? {
                create: {
                  amount: paid.toFixed(2),
                },
              }
            : undefined,
      },
      include: {
        patient: true,
        appointment: true,
        payments: true,
      },
    });

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET ALL INVOICES
export async function getAllInvoices(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: true,
        appointment: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get all invoices error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET INVOICE BY ID
export async function getInvoiceById(req, res) {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: true,
        appointment: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    return res.status(200).json({ invoice });
  } catch (error) {
    console.error("Get invoice by ID error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET INVOICES BY PATIENT
export async function getInvoicesByPatient(req, res) {
  try {
    const { patientId } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { patientId },
      include: {
        patient: true,
        appointment: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get patient invoices error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// ADD PAYMENT TO INVOICE
export async function addInvoicePayment(req, res) {
  try {
    const { invoiceId } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        message: "Payment amount is required",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero",
      });
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        const error = new Error("Invoice not found");
        error.statusCode = 404;
        throw error;
      }

      const total = Number(invoice.totalAmount);
      const currentPaid = Number(invoice.paidAmount);
      const newPaid = currentPaid + paymentAmount;

      if (newPaid > total) {
        const error = new Error(
          "Payment exceeds the remaining invoice balance"
        );
        error.statusCode = 400;
        throw error;
      }

      const status =
        newPaid === total
          ? "PAID"
          : "PARTIALLY_PAID";

      await tx.payment.create({
        data: {
          invoiceId,
          amount: paymentAmount.toFixed(2),
        },
      });

      return await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid.toFixed(2),
          status,
        },
        include: {
          patient: true,
          appointment: true,
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    });

    return res.status(200).json({
      message: "Payment added successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Add invoice payment error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

// GET PAYMENT HISTORY
export async function getInvoicePayments(req, res) {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      invoiceId: invoice.id,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      remainingAmount:
        Number(invoice.totalAmount) - Number(invoice.paidAmount),
      paymentCount: invoice.payments.length,
      payments: invoice.payments,
    });
  } catch (error) {
    console.error("Get invoice payments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
