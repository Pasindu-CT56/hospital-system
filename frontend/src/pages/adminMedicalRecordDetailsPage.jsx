
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminMedicalRecordDetailsPage() {
  const { recordId } = useParams();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function fetchRecord() {
      try {
        const response = await api.get(
          `/medical-records/${recordId}`,
          { headers }
        );

        setRecord(response.data.medicalRecord);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load medical record"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [recordId]);

  if (loading) {
    return <p className="text-gray-500">Loading medical record...</p>;
  }

  if (!record) {
    return (
      <div>
        <p className="text-gray-600">Medical record not found.</p>
        <Link
          to="/admin/medical-records"
          className="mt-4 inline-block text-blue-600"
        >
          Back to Medical Records
        </Link>
      </div>
    );
  }

  const patientName = `${record.patient?.firstName || ""} ${
    record.patient?.lastName || ""
  }`;

  const doctorName = `${record.doctor?.user?.firstName || ""} ${
    record.doctor?.user?.lastName || ""
  }`;

  const details = [
    { label: "Patient", value: patientName },
    { label: "Doctor", value: `Dr. ${doctorName}` },
    {
      label: "Record Date",
      value: record.recordDate
        ? new Date(record.recordDate).toLocaleDateString()
        : "-",
    },
    { label: "Diagnosis", value: record.diagnosis },
    { label: "Treatment", value: record.treatment },
    { label: "Prescription", value: record.prescription },
    { label: "Notes", value: record.notes },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Medical Record Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View patient medical information
          </p>
        </div>

        <Link
          to={`/admin/medical-records/edit/${record.id}`}
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Pencil size={17} />
          Edit Record
        </Link>
      </div>

      <div className="space-y-5 rounded-xl border bg-white p-6">
        {details.map((item) => (
          <div key={item.label} className="border-b pb-4 last:border-0">
            <p className="mb-2 text-sm font-medium text-gray-500">
              {item.label}
            </p>
            <p className="whitespace-pre-wrap text-gray-800">
              {item.value || "-"}
            </p>
          </div>
        ))}

        <Link
          to="/admin/medical-records"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Back to Medical Records
        </Link>
      </div>
    </div>
  );
}
