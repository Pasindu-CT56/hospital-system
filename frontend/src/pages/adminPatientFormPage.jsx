
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import api from "../lib/api.js";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  // Preserve the date portion returned by the database.
  if (/^\d{4}-\d{2}-\d{2}/.test(String(dateValue))) {
    return String(dateValue).slice(0, 10);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AdminPatientFormPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(patientId);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [patientId]);

  async function fetchPatient() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const patient = response.data.patient;

      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dateOfBirth: formatDateForInput(patient.dateOfBirth),
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
      });
    } catch (error) {
      console.error("Fetch patient error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load patient"
      );
      navigate("/admin/patients");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (
      formData.dateOfBirth &&
      formData.dateOfBirth > getTodayDate()
    ) {
      toast.error("Date of birth cannot be in the future");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const data = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
      };

      if (isEdit) {
        await api.put(`/patients/${patientId}`, data, config);
        toast.success("Patient updated successfully");
      } else {
        await api.post("/patients", data, config);
        toast.success("Patient added successfully");
      }

      navigate("/admin/patients");
    } catch (error) {
      console.error("Save patient error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save patient"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="py-10 text-center text-gray-500">
        Loading patient details...
      </p>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-700";

  return (
    <div>
      <Link
        to="/admin/patients"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back to Patients
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? "Edit Patient" : "Add Patient"}
        </h1>

        <p className="mt-2 text-gray-500">
          {isEdit
            ? "Update patient information"
            : "Enter the new patient information"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 rounded-xl border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={getTodayDate()}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter address"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Patient"
                : "Add Patient"}
          </button>

          <Link
            to="/admin/patients"
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
