
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import api from "../lib/api";

export default function ReceptionistPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setPatients(res.data.patients || []);
      })
      .catch((err) => {
        console.log(err);

        setError(
          err.response?.data?.message ||
          "Failed to load patients"
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
            Patients
          </h1>

          <p className="mt-2 text-gray-600">
            Manage patient information and records.
          </p>
        </div>

        <button
          onClick={() => navigate("/receptionist/add-patient")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Patient
        </button>
      </div>

      {/* Patients Table */}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-gray-500">
            Loading patients...
          </p>
        ) : error ? (
          <p className="p-6 text-red-600">
            {error}
          </p>
        ) : patients.length === 0 ? (
          <p className="p-6 text-gray-500">
            No patients found.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Date of Birth</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {patient.firstName} {patient.lastName}
                  </td>

                  <td className="p-4">
                    {patient.dateOfBirth
                      ? new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    {patient.phone || "-"}
                  </td>

                  <td className="p-4">
                    {patient.email || "-"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        patient.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {patient.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/receptionist/edit-patient/${patient.id}`
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
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
