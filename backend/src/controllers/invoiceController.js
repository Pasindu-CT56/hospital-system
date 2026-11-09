import prisma from "../lib/prisma.js";

// Validate UUID
function isValidUUID(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  );
}

// Convert money value to cents
function toCents(value) {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    !String(value).trim()
  ) {
    return null;
  }

  const normalized = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, decimal = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

// Convert cents to decimal string
function fromCents(cents) {
  return (cents / 100).toFixed(2);
}

// CREATE INVOICE
export async function createInvoice(req, res) {
  try {
    const {
      patientId,
      appointmentId,
      totalAmount,
      paidAmount = 0,
    } = req.body;

    if (!patientId || !appointmentId || totalAmount === undefined) {
      return res.status(400).json({
        message: "Patient ID, appointment ID and total amount are required",
      });
    }

    if (!isValidUUID(patientId) || !isValidUUID(appointmentId)) {
      return res.status(400).json({
        message: "Invalid patient ID or appointment ID",
      });
    }

    const total = toCents(totalAmount);
    const paid = toCents(paidAmount);

    if (total === null || total <= 0) {
      return res.status(400).json({
        message: "Total amount must be a valid amount greater than zero",
      });
    }

    if (paid === null || paid < 0) {
      return res.status(400).json({
        message: "Paid amount must be a valid non-negative amount",
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
        totalAmount: fromCents(total),
        paidAmount: fromCents(paid),
        status,
        ...(paid > 0 && {
          payments: {
            create: {
              amount: fromCents(paid),
            },
          },
        }),
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

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "An invoice already exists for this appointment",
      });
    }

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

    if (!isValidUUID(invoiceId)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

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

    if (!isValidUUID(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

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

    if (!isValidUUID(invoiceId)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    if (amount === undefined) {
      return res.status(400).json({
        message: "Payment amount is required",
      });
    }

    const paymentCents = toCents(amount);

    if (paymentCents === null || paymentCents <= 0) {
      return res.status(400).json({
        message: "Payment amount must be a valid amount greater than zero",
      });
    }

    const updatedInvoice = await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
        });

        if (!invoice) {
          const error = new Error("Invoice not found");
          error.statusCode = 404;
          throw error;
        }

        const total = toCents(invoice.totalAmount.toString());
        const currentPaid = toCents(invoice.paidAmount.toString());

        if (total === null || currentPaid === null) {
          const error = new Error("Invalid invoice amount data");
          error.statusCode = 500;
          throw error;
        }

        const newPaid = currentPaid + paymentCents;

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
            amount: fromCents(paymentCents),
          },
        });

        return await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: fromCents(newPaid),
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
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return res.status(200).json({
      message: "Payment added successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Add invoice payment error:", error);

    if (error.code === "P2034") {
      return res.status(409).json({
        message: "Payment conflict. Please try again",
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

// GET PAYMENT HISTORY
export async function getInvoicePayments(req, res) {
  try {
    const { invoiceId } = req.params;

    if (!isValidUUID(invoiceId)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

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

    const total = toCents(invoice.totalAmount.toString());
    const paid = toCents(invoice.paidAmount.toString());

    return res.status(200).json({
      invoiceId: invoice.id,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      remainingAmount: fromCents(total - paid),
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