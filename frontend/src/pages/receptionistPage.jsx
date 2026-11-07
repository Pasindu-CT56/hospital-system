
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  LogOut,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "../lib/api";

import ReceptionistPatientsPage from "./receptionistPatientsPage";
import ReceptionistAddPatientPage from "./receptionistAddPatientPage";
import ReceptionistEditPatientPage from "./receptionistEditPatientPage";

import ReceptionistAppointmentsPage from "./receptionistAppointmentsPage";
import ReceptionistAddAppointmentPage from "./receptionistAddAppointmentPage";
import ReceptionistEditAppointmentPage from "./receptionistEditAppointmentPage";

export default function ReceptionistPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Fetch Dashboard Data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!token || !user || user.role !== "RECEPTIONIST") {
        setIsLoading(false);
        return;
      }

      try {
        const [patientRes, appointmentRes] = await Promise.all([
          api.get("/patients", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          api.get("/appointments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setPatients(patientRes.data.patients || []);
        setAppointments(appointmentRes.data.appointments || []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  // Authentication
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role Protection
  if (user.role !== "RECEPTIONIST") {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "DOCTOR") {
      return <Navigate to="/doctor" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // Today's Appointments
  const today = new Date();

  const todaysAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  });

  // Sidebar Active Links
  const isActive = (path) => location.pathname === path;

  const isPatientsActive =
    location.pathname.startsWith("/receptionist/patients") ||
    location.pathname === "/receptionist/add-patient" ||
    location.pathname.startsWith("/receptionist/edit-patient");

  const isAppointmentsActive =
    location.pathname.startsWith("/receptionist/appointments") ||
    location.pathname === "/receptionist/add-appointment" ||
    location.pathname.startsWith("/receptionist/edit-appointment");

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
          to="/receptionist"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            isActive("/receptionist")
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* Patients */}
        <Link
          to="/receptionist/patients"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            isPatientsActive
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users size={20} />
          Patients
        </Link>

        {/* Appointments */}
        <Link
          to="/receptionist/appointments"
          className={`mb-3 flex items-center gap-3 rounded-lg p-3 ${
            isAppointmentsActive
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CalendarDays size={20} />
          Appointments
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
                  Receptionist Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                  Welcome, {user.firstName} {user.lastName}.
                </p>

                {/* Dashboard Cards */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

                  {/* Total Patients */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Patients
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-900">
                          {isLoading ? "..." : patients.length}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                        <Users size={26} />
                      </div>
                    </div>
                  </div>

                  {/* Total Appointments */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Appointments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-900">
                          {isLoading ? "..." : appointments.length}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-green-100 p-3 text-green-600">
                        <CalendarDays size={26} />
                      </div>
                    </div>
                  </div>

                  {/* Today's Appointments */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Today's Appointments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-900">
                          {isLoading ? "..." : todaysAppointments.length}
                        </h2>
                      </div>

                      <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                        <Clock size={26} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patients"
            element={<ReceptionistPatientsPage />}
          />

          <Route
            path="/add-patient"
            element={<ReceptionistAddPatientPage />}
          />

          <Route
            path="/edit-patient/:patientId"
            element={<ReceptionistEditPatientPage />}
          />

          {/* Appointment Routes */}
          <Route
            path="/appointments"
            element={<ReceptionistAppointmentsPage />}
          />

          <Route
            path="/add-appointment"
            element={<ReceptionistAddAppointmentPage />}
          />

          <Route
            path="/edit-appointment/:appointmentId"
            element={<ReceptionistEditAppointmentPage />}
          />

        </Routes>

      </div>
    </div>
  );
}
