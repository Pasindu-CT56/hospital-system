
import { Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

import Dashboard from "./dashboardPage.jsx";

export default function AdminPage() {
  const navigate = useNavigate();

  // Get logged-in user
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

  // Check admin role
  if (user.role !== "ADMIN") {
    if (user.role === "RECEPTIONIST") {
      return <Navigate to="/receptionist" replace />;
    }

    if (user.role === "DOCTOR") {
      return <Navigate to="/doctor" replace />;
    }

    return <Navigate to="/login" replace />;
  }

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

        <Link
          to="/admin"
          className="mb-3 flex items-center gap-3 rounded-lg bg-blue-600 p-3 text-white"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          to="/admin/patients"
          className="mb-3 flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100"
        >
          <Users size={20} />
          Patients
        </Link>

        <Link
          to="/admin/doctors"
          className="mb-3 flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100"
        >
          <Stethoscope size={20} />
          Doctors
        </Link>

        <Link
          to="/admin/appointments"
          className="mb-3 flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100"
        >
          <CalendarDays size={20} />
          Appointments
        </Link>

        <Link
          to="/admin/medical-records"
          className="mb-3 flex items-center gap-3 rounded-lg p-3 text-gray-600 hover:bg-gray-100"
        >
          <FileText size={20} />
          Medical Records
        </Link>

        {/* Logout Button */}
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
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>

    </div>
  );
}
