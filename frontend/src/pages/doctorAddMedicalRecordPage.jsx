
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function DoctorAddMedicalRecordPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch Appointments and Medical Records
  useEffect(() => {
    async function fetchData() {
      try {
        const [appointmentRes, recordRes] = await Promise.all([
          api.get("/appointments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          api.get("/medical-records", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const allAppointments =
          appointmentRes.data.appointments || [];

        const medicalRecords =
          recordRes.data.medicalRecords || [];

        const availableAppointments = allAppointments.filter(
          (appointment) =>
            appointment.status !== "CANCELLED" &&
            !medicalRecords.some(
              (record) =>
                record.appointmentId === appointment.id
            )
        );

        setAppointments(availableAppointments);
      } catch (error) {
        console.log(error);

        toast.error(
          error.response?.data?.message ||
          "Failed to load appointments"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // Create Medical Record
  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedAppointment || !diagnosis.trim()) {
      toast.error(
        "Please select an appointment and enter diagnosis"
      );
      return;
    }

    const appointment = appointments.find(
      (item) => item.id === selectedAppointment
    );

    if (!appointment) {
      toast.error("Invalid appointment selected");
      return;
    }

    try {
      setIsSaving(true);

      await api.post(
        "/medical-records",
        {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          diagnosis: diagnosis.trim(),
          treatment: treatment.trim(),
          prescription: prescription.trim(),
          notes: notes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Medical record created successfully");

      navigate("/doctor/medical-records");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to create medical record"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Add Medical Record
        </h1>

        <p className="mt-2 text-gray-600">
          Create a new medical record for your patient.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit}>

          {/* Appointment */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Appointment *
            </label>

            <select
              value={selectedAppointment}
              onChange={(e) =>
                setSelectedAppointment(e.target.value)
              }
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            >
              <option value="">
                {isLoading
                  ? "Loading appointments..."
                  : "Select an appointment"}
              </option>

              {appointments.map((appointment) => (
                <option
                  key={appointment.id}
                  value={appointment.id}
                >
                  {appointment.patient?.firstName}{" "}
                  {appointment.patient?.lastName}
                  {" - "}
                  {new Date(
                    appointment.appointmentDate
                  ).toLocaleString()}
                </option>
              ))}
            </select>

            {!isLoading && appointments.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No available appointments.
              </p>
            )}
          </div>

          {/* Diagnosis */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Diagnosis *
            </label>

            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              rows={3}
              placeholder="Enter diagnosis"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Treatment */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Treatment
            </label>

            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={3}
              placeholder="Enter treatment details"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Prescription */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Prescription
            </label>

            <textarea
              value={prescription}
              onChange={(e) =>
                setPrescription(e.target.value)
              }
              rows={3}
              placeholder="Enter prescription details"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter additional notes"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={
                isSaving ||
                isLoading ||
                appointments.length === 0
              }
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Medical Record"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/doctor/medical-records")
              }
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
