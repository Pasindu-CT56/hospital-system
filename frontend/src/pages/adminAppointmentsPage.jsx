
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  async function fetchAppointments() {
    try {
      const response = await api.get("/appointments", { headers });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel(appointmentId) {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await api.patch(
        `/appointments/${appointmentId}/cancel`,
        {},
        { headers }
      );

      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Appointment Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hospital appointments
          </p>
        </div>

        <Link
          to="/admin/appointments/add"
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Appointment
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {loading ? (
          <p className="p-6 text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="p-6 text-gray-500">No appointments found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t">
                  <td className="p-4">
                    {appointment.patient?.firstName}{" "}
                    {appointment.patient?.lastName}
                  </td>

                  <td className="p-4">
                    Dr. {appointment.doctor?.user?.firstName}{" "}
                    {appointment.doctor?.user?.lastName}
                  </td>

                  <td className="p-4">
                    {formatDate(appointment.appointmentDate)}
                  </td>

                  <td className="p-4">{appointment.reason || "-"}</td>

                  <td className="p-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {appointment.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {appointment.status !== "CANCELLED" &&
                        appointment.status !== "COMPLETED" && (
                          <>
                            <Link
                              to={`/admin/appointments/edit/${appointment.id}`}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </Link>

                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                      {(appointment.status === "CANCELLED" ||
                        appointment.status === "COMPLETED") && (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </div>
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
