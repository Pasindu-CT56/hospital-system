import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminCreateInvoicePage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    totalAmount: "",
    paidAmount: "0",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          patientsResponse,
          appointmentsResponse,
          invoicesResponse,
        ] = await Promise.all([
          api.get("/patients", { headers }),
          api.get("/appointments", { headers }),
          api.get("/invoices", { headers }),
        ]);

        setPatients(
          (patientsResponse.data.patients || []).filter(
            (patient) => patient.isActive
          )
        );

        setAppointments(appointmentsResponse.data.appointments || []);

        const invoicedAppointmentIds = new Set(
          (invoicesResponse.data.invoices || []).map(
            (invoice) => invoice.appointmentId
          )
        );

        setAppointments((previous) =>
          previous.filter(
            (appointment) =>
              !invoicedAppointmentIds.has(appointment.id)
          )
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const availableAppointments = appointments.filter(
    (appointment) =>
      appointment.patientId === formData.patientId &&
      appointment.status !== "CANCELLED"
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "patientId" ? { appointmentId: "" } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const totalAmount = Number(formData.totalAmount);
    const paidAmount = Number(formData.paidAmount);

    if (
      !Number.isFinite(totalAmount) ||
      !Number.isFinite(paidAmount) ||
      totalAmount <= 0 ||
      paidAmount < 0 ||
      paidAmount > totalAmount ||
      !/^\d+(\.\d{1,2})?$/.test(formData.totalAmount) ||
      !/^\d+(\.\d{1,2})?$/.test(formData.paidAmount)
    ) {
      toast.error("Please enter valid amounts with up to 2 decimal places");
      return;
    }

    if (!formData.patientId || !formData.appointmentId) {
      toast.error("Please select a patient and appointment");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/invoices",
        {
          patientId: formData.patientId,
          appointmentId: formData.appointmentId,
          totalAmount: formData.totalAmount,
          paidAmount: formData.paidAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Invoice created successfully");
      navigate("/admin/billing");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create invoice"
      );
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Invoice
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enter invoice and payment information
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Patient
          </label>

          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
          >
            <option value="">Select Patient</option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Appointment
          </label>

          <select
            name="appointmentId"
            value={formData.appointmentId}
            onChange={handleChange}
            required
            disabled={!formData.patientId}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600 disabled:bg-gray-100"
          >
            <option value="">Select Appointment</option>

            {availableAppointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {new Date(
                  appointment.appointmentDate
                ).toLocaleString()}{" "}
                - {appointment.status}
              </option>
            ))}
          </select>

          {formData.patientId && availableAppointments.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No available appointments for this patient.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total Amount
          </label>

          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Enter total amount"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Initial Paid Amount
          </label>

          <input
            type="number"
            name="paidAmount"
            value={formData.paidAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Enter paid amount"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
          >
            Create Invoice
          </button>

          <Link
            to="/admin/billing"
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}