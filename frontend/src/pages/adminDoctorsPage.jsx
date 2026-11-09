
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, UserX } from "lucide-react";
import toast from "react-hot-toast";

import api from "../lib/api.js";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchDoctors() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load doctors"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function handleDeactivate(doctorId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this doctor account?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Doctor deactivated successfully");

      setDoctors((previous) =>
        previous.filter((doctor) => doctor.id !== doctorId)
      );
    } catch (error) {
      console.error("Deactivate doctor error:", error);
      toast.error(
        error.response?.data?.message || "Failed to deactivate doctor"
      );
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName =
      `${doctor.user?.firstName || ""} ${doctor.user?.lastName || ""}`.toLowerCase();

    return (
      fullName.includes(search.toLowerCase()) ||
      doctor.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.licenseNumber?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Doctor Management
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage doctor accounts
          </p>
        </div>

        <Link
          to="/admin/doctors/add"
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Doctor
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
        <Search size={19} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search by name, email, specialization or license..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-gray-500">
            Loading doctors...
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-4">Doctor Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Specialization</th>
                <th className="px-5 py-4">License Number</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {doctor.user?.firstName} {doctor.user?.lastName}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {doctor.user?.email || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {doctor.specialization || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {doctor.licenseNumber || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/doctors/edit/${doctor.id}`}
                          title="Edit doctor"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() => handleDeactivate(doctor.id)}
                          title="Deactivate doctor"
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
                    colSpan="5"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No doctors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Total doctors: {filteredDoctors.length}
      </p>
    </div>
  );
}
