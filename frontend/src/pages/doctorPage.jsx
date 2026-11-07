
import { useEffect, useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  LogOut,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "../lib/api";

import DoctorAppointmentsPage from "./doctorAppointmentsPage";
import DoctorMedicalRecordsPage from "./doctorMedicalRecordsPage";
import DoctorAddMedicalRecordPage from "./doctorAddMedicalRecordPage";

export default function DoctorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Check authentication
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check doctor role
  if (user.role !== "DOCTOR") {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "RECEPTIONIST") {
      return <Navigate to="/receptionist" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [appointmentRes, medicalRecordRes] =
          await Promise.all([
            api.get("/appointments", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            api.get("/medical-records", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        setAppointments(
          appointmentRes.data.appointments || []
        );

        setMedicalRecords(
          medicalRecordRes.data.medicalRecords || []
        );
      } catch (error) {
        console.log("Dashboard data error:", error);

        toast.error(
          "Failed to load dashboard statistics"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  // Calculate statistics
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  ).length;

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen w-full">

      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r bg-white p-5">

        <h1 className="mb-10 text-xl font-bold text-blue-900">
          Hospital MS
        </h1>

        {/* Dashboard */}
        <Link
          to="/doctor"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            location.pathname === "/doctor"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* Appointments */}
        <Link
          to="/doctor/appointments"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            location.pathname === "/doctor/appointments"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CalendarDays size={20} />
          Appointments
        </Link>

        {/* Medical Records */}
        <Link
          to="/doctor/medical-records"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            location.pathname.startsWith("/doctor/medical-records") ||
            location.pathname === "/doctor/add-medical-record"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText size={20} />
          Medical Records
        </Link>

        {/* Logout */}
        <div className="mt-auto border-t pt-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">

        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Doctor Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                  Welcome, {user.firstName} {user.lastName}.
                </p>

                {/* Statistics */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Appointments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-blue-900">
                          {isLoading ? "..." : appointments.length}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                        <CalendarDays size={26} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Completed Appointments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-700">
                          {isLoading ? "..." : completedAppointments}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-green-100 p-3 text-green-600">
                        <LayoutDashboard size={26} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Medical Records
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-purple-700">
                          {isLoading ? "..." : medicalRecords.length}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                        <FileText size={26} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            }
          />

          {/* Appointments */}
          <Route
            path="/appointments"
            element={<DoctorAppointmentsPage />}
          />

          {/* Medical Records */}
          <Route
            path="/medical-records"
            element={<DoctorMedicalRecordsPage />}
          />

          {/* Add Medical Record */}
          <Route
            path="/add-medical-record"
            element={<DoctorAddMedicalRecordPage />}
          />

        </Routes>
      </div>
    </div>
  );
}
