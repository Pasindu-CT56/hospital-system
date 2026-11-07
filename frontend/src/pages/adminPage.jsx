
import { Link, Route, Routes } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";

import Dashboard from "./dashboardPage.jsx";

export default function AdminPage() {
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
