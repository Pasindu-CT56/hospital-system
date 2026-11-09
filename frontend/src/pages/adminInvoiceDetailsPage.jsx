import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminInvoiceDetailsPage() {
  const { invoiceId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoiceData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [invoiceResponse, paymentsResponse] = await Promise.all([
        api.get(`/invoices/${invoiceId}`, { headers }),
        api.get(`/invoices/${invoiceId}/payments`, { headers }),
      ]);

      setInvoice(invoiceResponse.data.invoice);
      setPaymentInfo(paymentsResponse.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load invoice details"
      );
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  async function handleAddPayment(e) {
    e.preventDefault();

    const amountText = paymentAmount.trim();
    const amount = Number(amountText);

    if (!/^\d+(\.\d{1,2})?$/.test(amountText) || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount with up to 2 decimal places");
      return;
    }

    const remainingAmount = Number(paymentInfo?.remainingAmount || 0);

    if (amount > remainingAmount) {
      toast.error("Payment cannot exceed the remaining amount");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    setSubmitting(true);

    try {
      await api.patch(
        `/invoices/${invoiceId}/payment`,
        { amount: amountText },
        { headers }
      );

      toast.success("Payment added successfully");
      setPaymentAmount("");
      await fetchInvoiceData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add payment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatAmount(amount) {
    return Number(amount || 0).toFixed(2);
  }

  if (loading) {
    return <p className="text-gray-500">Loading invoice...</p>;
  }

  if (!invoice || !paymentInfo) {
    return (
      <div>
        <p className="text-gray-600">Invoice not found.</p>
        <Link
          to="/admin/billing"
          className="mt-4 inline-block text-blue-600"
        >
          Back to Billing
        </Link>
      </div>
    );
  }

  const remainingAmount = Number(paymentInfo.remainingAmount || 0);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Invoice Details
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View invoice information and payment history
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {formatAmount(paymentInfo.totalAmount)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Paid Amount</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatAmount(paymentInfo.paidAmount)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Remaining Amount</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatAmount(remainingAmount)}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Invoice Information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="mt-1 font-medium text-gray-800">
              {invoice.patient?.firstName} {invoice.patient?.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Appointment Date</p>
            <p className="mt-1 font-medium text-gray-800">
              {invoice.appointment?.appointmentDate
                ? new Date(
                    invoice.appointment.appointmentDate
                  ).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Invoice Status</p>
            <p className="mt-1 font-medium text-gray-800">
              {invoice.status?.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {remainingAmount > 0 && (
        <div className="mb-6 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Add Payment
          </h2>

          <form
            onSubmit={handleAddPayment}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0.01"
              max={remainingAmount}
              step="0.01"
              required
              placeholder="Enter payment amount"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Payment"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-6 overflow-x-auto rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment History
          </h2>
        </div>

        {!paymentInfo.payments || paymentInfo.payments.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">
            No payments recorded.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>

            <tbody>
              {paymentInfo.payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="p-4">
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleString()
                      : payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString()
                        : "-"}
                  </td>

                  <td className="p-4 font-medium">
                    {formatAmount(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link
        to="/admin/billing"
        className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        Back to Billing
      </Link>
    </div>
  );
}