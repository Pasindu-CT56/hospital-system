
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function ReceptionistAppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  async function fetchAppointments() {
    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);
      setError("");

      const res = await api.get("/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
        "Failed to load appointments"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel() {
    if (!selectedAppointment) return;

    const token = localStorage.getItem("token");

    try {
      setIsCancelling(true);

      await api.patch(
        `/appointments/${selectedAppointment.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Appointment cancelled successfully");
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message ||
        "Failed to cancel appointment"
      );
    } finally {
      setIsCancelling(false);
    }
  }

  function getStatusStyle(status) {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-700",
      CONFIRMED: "bg-green-100 text-green-700",
      COMPLETED: "bg-purple-100 text-purple-700",
      CANCELLED: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            Appointments
          </h1>
          <p className="mt-2 text-gray-600">
            Manage patient appointments.
          </p>
        </div>

        <button
          onClick={() => navigate("/receptionist/add-appointment")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-gray-500">
            Loading appointments...
          </p>
        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>
        ) : appointments.length === 0 ? (
          <p className="p-6 text-gray-500">
            No appointments found.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
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
              {appointments.map((appointment) => {
                const doctor = appointment.doctor?.user;

                return (
                  <tr
                    key={appointment.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">
                      {appointment.patient?.firstName}{" "}
                      {appointment.patient?.lastName}
                    </td>

                    <td className="p-4">
                      {doctor
                        ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                        : "-"}
                    </td>

                    <td className="p-4">
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {appointment.reason || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {appointment.status !== "CANCELLED" &&
                          appointment.status !== "COMPLETED" && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/receptionist/edit-appointment/${appointment.id}`
                                  )
                                }
                                title="Edit appointment"
                                className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedAppointment(appointment)
                                }
                                title="Cancel appointment"
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}

                        {(appointment.status === "CANCELLED" ||
                          appointment.status === "COMPLETED") && (
                          <span className="text-xs text-gray-400">
                            No actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Cancel Appointment
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to cancel this appointment?
              This will change its status to CANCELLED.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                disabled={isCancelling}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                No, Keep It
              </button>

              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
