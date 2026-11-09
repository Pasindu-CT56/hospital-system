
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function AdminEditMedicalRecordPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchRecord() {
      try {
        const response = await api.get(
          `/medical-records/${recordId}`,
          { headers }
        );

        const record = response.data.medicalRecord;

        setFormData({
          diagnosis: record.diagnosis || "",
          treatment: record.treatment || "",
          prescription: record.prescription || "",
          notes: record.notes || "",
        });
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

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.put(
        `/medical-records/${recordId}`,
        formData,
        { headers }
      );

      toast.success("Medical record updated successfully");
      navigate(`/admin/medical-records/${recordId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update medical record"
      );
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading medical record...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Medical Record
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update medical record information
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        {[
          { name: "diagnosis", label: "Diagnosis", required: true },
          { name: "treatment", label: "Treatment" },
          { name: "prescription", label: "Prescription" },
          { name: "notes", label: "Notes" },
        ].map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {field.label}
            </label>

            <textarea
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              rows="3"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
          >
            Update Record
          </button>

          <Link
            to={`/admin/medical-records/${recordId}`}
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
