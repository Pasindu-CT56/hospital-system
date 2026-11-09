import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminAppointmentFormPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(appointmentId);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    reason: "",
    status: "SCHEDULED",
  });

  // Convert UTC date to local datetime-local format
  function formatLocalDateTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const requests = [
          api.get("/patients", { headers }),
          api.get("/doctors", { headers }),
        ];

        if (isEdit) {
          requests.push(
            api.get(`/appointments/${appointmentId}`, { headers })
          );
        }

        const responses = await Promise.all(requests);

        setPatients(responses[0].data.patients || []);
        setDoctors(responses[1].data.doctors || []);

        if (isEdit) {
          const appointment = responses[2].data.appointment;

          setFormData({
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentDate: formatLocalDateTime(
              appointment.appointmentDate
            ),
            reason: appointment.reason || "",
            status: appointment.status,
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [appointmentId]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        appointmentDate: new Date(
          formData.appointmentDate
        ).toISOString(),
      };

      if (isEdit) {
        await api.put(`/appointments/${appointmentId}`, payload, { headers });
        toast.success("Appointment updated successfully");
      } else {
        await api.post("/appointments", payload, { headers });
        toast.success("Appointment created successfully");
      }

      navigate("/admin/appointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Appointment" : "Add Appointment"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enter appointment information
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
            Doctor
          </label>

          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
          >
            <option value="">Select Doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.user?.firstName} {doctor.user?.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Appointment Date & Time
          </label>

          <input
            type="datetime-local"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Reason
          </label>

          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Enter appointment reason"
          />
        </div>

        {isEdit && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
          >
            {isEdit ? "Update Appointment" : "Create Appointment"}
          </button>

          <Link
            to="/admin/appointments"
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}