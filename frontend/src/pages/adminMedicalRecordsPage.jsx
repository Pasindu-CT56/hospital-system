
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminMedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function fetchData() {
      try {
        const [recordsResponse, patientsResponse] = await Promise.all([
          api.get("/medical-records", { headers }),
          api.get("/patients", { headers }),
        ]);

        setRecords(recordsResponse.data.medicalRecords || []);
        setPatients(patientsResponse.data.patients || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load medical records"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredRecords = records.filter((record) => {
    const patientName =
      `${record.patient?.firstName || ""} ${record.patient?.lastName || ""}`.toLowerCase();

    const searchMatch =
      patientName.includes(search.toLowerCase()) ||
      (record.diagnosis || "").toLowerCase().includes(search.toLowerCase());

    const patientMatch =
      !patientFilter || record.patientId === patientFilter;

    return searchMatch && patientMatch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Medical Records
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage patient medical records
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or diagnosis..."
            className="w-full rounded-lg border bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-600"
        >
          <option value="">All Patients</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {loading ? (
          <p className="p-6 text-gray-500">Loading medical records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="p-6 text-gray-500">No medical records found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Diagnosis</th>
                <th className="p-4">Record Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="p-4">
                    {record.patient?.firstName}{" "}
                    {record.patient?.lastName}
                  </td>

                  <td className="p-4">
                    Dr. {record.doctor?.user?.firstName}{" "}
                    {record.doctor?.user?.lastName}
                  </td>

                  <td className="p-4">
                    <span className="line-clamp-2">
                      {record.diagnosis}
                    </span>
                  </td>

                  <td className="p-4">
                    {record.recordDate
                      ? new Date(record.recordDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/admin/medical-records/${record.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                      View
                    </Link>
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
