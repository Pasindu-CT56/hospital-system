
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

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

export default function ReceptionistEditPatientPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await api.get(`/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const patient = res.data.patient;

        setFirstName(patient.firstName || "");
        setLastName(patient.lastName || "");
        setDateOfBirth(formatDateForInput(patient.dateOfBirth));
        setPhone(patient.phone || "");
        setEmail(patient.email || "");
        setAddress(patient.address || "");
      } catch (error) {
        console.log(error);

        toast.error(
          error.response?.data?.message ||
          "Failed to load patient"
        );

        navigate("/receptionist/patients");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatient();
  }, [patientId, token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (dateOfBirth && dateOfBirth > getTodayDate()) {
      toast.error("Date of birth cannot be in the future");
      return;
    }

    try {
      setIsSaving(true);

      await api.put(
        `/patients/${patientId}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth || null,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Patient updated successfully");
      navigate("/receptionist/patients");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update patient"
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-gray-500">Loading patient...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Edit Patient
        </h1>

        <p className="mt-2 text-gray-600">
          Update the patient's information.
        </p>
      </div>

      <div className="max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                First Name *
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Last Name *
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date of Birth
            </label>

            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={getTodayDate()}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Updating..." : "Update Patient"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/receptionist/patients")}
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