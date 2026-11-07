
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import api from "../lib/api";

export default function DoctorMedicalRecordsPage() {
  const navigate = useNavigate();

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/medical-records", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setMedicalRecords(res.data.medicalRecords || []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
          "Failed to load medical records"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            Medical Records
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage your patients' medical records.
          </p>
        </div>

        <button
          onClick={() => navigate("/doctor/add-medical-record")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Medical Record
        </button>
      </div>

      {/* Medical Records Table */}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-gray-500">
            Loading medical records...
          </p>
        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>
        ) : medicalRecords.length === 0 ? (
          <p className="p-6 text-gray-500">
            No medical records found.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Diagnosis</th>
                <th className="p-4">Treatment</th>
                <th className="p-4">Prescription</th>
                <th className="p-4">Record Date</th>
              </tr>
            </thead>

            <tbody>
              {medicalRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {record.patient?.firstName}{" "}
                    {record.patient?.lastName}
                  </td>

                  <td className="p-4">
                    {record.diagnosis || "-"}
                  </td>

                  <td className="p-4">
                    {record.treatment || "-"}
                  </td>

                  <td className="p-4">
                    {record.prescription || "-"}
                  </td>

                  <td className="p-4">
                    {record.recordDate
                      ? new Date(
                          record.recordDate
                        ).toLocaleDateString()
                      : "-"}
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
