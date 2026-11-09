
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, UserX } from "lucide-react";
import toast from "react-hot-toast";

import api from "../lib/api.js";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchPatients() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients(response.data.patients || []);
    } catch (error) {
      console.error("Fetch patients error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load patients"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  async function handleDeactivate(patientId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this patient?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Patient deactivated successfully");

      setPatients((previous) =>
        previous.filter((patient) => patient.id !== patientId)
      );
    } catch (error) {
      console.error("Deactivate patient error:", error);
      toast.error(
        error.response?.data?.message || "Failed to deactivate patient"
      );
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.firstName} ${patient.lastName}`.toLowerCase();

    return (
      fullName.includes(search.toLowerCase()) ||
      patient.email?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone?.includes(search)
    );
  });

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Patient Management
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage patient information
          </p>
        </div>

        <Link
          to="/admin/patients/add"
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Patient
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
        <Search size={19} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-gray-500">
            Loading patients...
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-4">Patient Name</th>
                <th className="px-5 py-4">Date of Birth</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Address</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {patient.firstName} {patient.lastName}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(patient.dateOfBirth)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {patient.phone || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {patient.email || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {patient.address || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/patients/edit/${patient.id}`}
                          title="Edit patient"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() => handleDeactivate(patient.id)}
                          title="Deactivate patient"
                          className="text-red-600 hover:text-red-800"
                        >
                          <UserX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Total patients: {filteredPatients.length}
      </p>
    </div>
  );
}
