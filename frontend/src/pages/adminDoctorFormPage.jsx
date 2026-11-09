
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import api from "../lib/api.js";

export default function AdminDoctorFormPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(doctorId);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
  });

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchDoctor();
    }
  }, [doctorId]);

  async function fetchDoctor() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const doctor = response.data.doctor;

      setFormData({
        firstName: doctor.user?.firstName || "",
        lastName: doctor.user?.lastName || "",
        email: doctor.user?.email || "",
        password: "",
        specialization: doctor.specialization || "",
        licenseNumber: doctor.licenseNumber || "",
      });
    } catch (error) {
      console.error("Fetch doctor error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load doctor"
      );
      navigate("/admin/doctors");
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

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast.error("First name, last name and email are required");
      return;
    }

    if (!isEdit && formData.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization.trim() || null,
        licenseNumber: formData.licenseNumber.trim() || null,
      };

      if (!isEdit) {
        data.password = formData.password;
        await api.post("/doctors", data, config);
        toast.success("Doctor account created successfully");
      } else {
        await api.put(`/doctors/${doctorId}`, data, config);
        toast.success("Doctor details updated successfully");
      }

      navigate("/admin/doctors");
    } catch (error) {
      console.error("Save doctor error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save doctor"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="py-10 text-center text-gray-500">
        Loading doctor details...
      </p>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-700";

  return (
    <div>
      <Link
        to="/admin/doctors"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back to Doctors
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? "Edit Doctor" : "Add Doctor"}
        </h1>

        <p className="mt-2 text-gray-500">
          {isEdit
            ? "Update doctor account information"
            : "Create a new doctor account"}
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
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter email address"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
                className={inputClass}
                placeholder="Minimum 8 characters"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Specialization
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter specialization"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter license number"
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
                ? "Update Doctor"
                : "Create Doctor"}
          </button>

          <Link
            to="/admin/doctors"
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
