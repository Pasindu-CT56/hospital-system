
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/appointments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setAppointments(res.data.appointments);
      })
      .catch((err) => {
        console.log(err);
        setError(
          err.response?.data?.message ||
          "Failed to load appointments"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900">
        My Appointments
      </h1>

      <p className="mt-2 text-gray-600">
        View your assigned patient appointments.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
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
                <th className="p-4">Date & Time</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {appointment.patient.firstName}{" "}
                    {appointment.patient.lastName}
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
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {appointment.status}
                    </span>
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
