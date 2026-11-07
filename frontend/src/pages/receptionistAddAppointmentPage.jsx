
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function ReceptionistAddAppointmentPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          api.get("/patients", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          api.get("/doctors", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setPatients(patientRes.data.patients || []);
        setDoctors(doctorRes.data.doctors || []);
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message ||
          "Failed to load patients and doctors"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!patientId || !doctorId || !appointmentDate) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setIsSaving(true);

      await api.post(
        "/appointments",
        {
          patientId,
          doctorId,
          appointmentDate: new Date(appointmentDate).toISOString(),
          reason: reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Appointment created successfully");
      navigate("/receptionist/appointments");
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to create appointment"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Add Appointment
        </h1>
        <p className="mt-2 text-gray-600">
          Schedule an appointment for a patient.
        </p>
      </div>

      <div className="max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-gray-500">
            Loading patients and doctors...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Patient */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Patient *
              </label>

              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select a patient</option>

                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>

              {patients.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No active patients available.
                </p>
              )}
            </div>

            {/* Doctor */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Doctor *
              </label>

              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select a doctor</option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user?.firstName || doctor.firstName}{" "}
                    {doctor.user?.lastName || doctor.lastName}
                    {doctor.specialization
                      ? ` - ${doctor.specialization}`
                      : ""}
                  </option>
                ))}
              </select>

              {doctors.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No active doctors available.
                </p>
              )}
            </div>

            {/* Appointment Date */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Appointment Date & Time *
              </label>

              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Reason
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter appointment reason"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  isSaving ||
                  patients.length === 0 ||
                  doctors.length === 0
                }
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Appointment"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/receptionist/appointments")}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
