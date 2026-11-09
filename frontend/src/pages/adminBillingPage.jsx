import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInvoices(response.data.invoices || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load invoices"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  function formatAmount(amount) {
    return Number(amount || 0).toFixed(2);
  }

  function statusStyle(status) {
    if (status === "PAID") {
      return "bg-green-100 text-green-700";
    }

    if (status === "PARTIALLY_PAID") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Billing Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage invoices and patient payments
          </p>
        </div>

        <Link
          to="/admin/billing/add"
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {loading ? (
          <p className="p-6 text-gray-500">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="p-6 text-gray-500">No invoices found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Appointment Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="p-4">
                    {invoice.patient?.firstName}{" "}
                    {invoice.patient?.lastName}
                  </td>

                  <td className="p-4">
                    {invoice.appointment?.appointmentDate
                      ? new Date(
                          invoice.appointment.appointmentDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    {formatAmount(invoice.totalAmount)}
                  </td>

                  <td className="p-4">
                    {formatAmount(invoice.paidAmount)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                        invoice.status
                      )}`}
                    >
                      {invoice.status?.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/admin/billing/${invoice.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
