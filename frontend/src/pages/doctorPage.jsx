import { useEffect, useState } from "react";

import {
  NavLink,
  Navigate,
  useNavigate,
  Routes,
  Route,
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

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token || !user || user.role !== "DOCTOR") {
        setIsLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [appointmentRes, medicalRecordRes] = await Promise.all([
          api.get("/appointments", { headers }),
          api.get("/medical-records", { headers }),
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
          error.response?.data?.message ||
            "Failed to load dashboard statistics"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [token, user?.role]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "DOCTOR") {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "RECEPTIONIST") {
      return <Navigate to="/receptionist" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  ).length;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  }

  const menuItems = [
    {
      title: "Dashboard",
      path: "/doctor",
      icon: LayoutDashboard,
      end: true,
    },
    {
      title: "Appointments",
      path: "/doctor/appointments",
      icon: CalendarDays,
    },
    {
      title: "Medical Records",
      path: "/doctor/medical-records",
      icon: FileText,
    },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-white p-5">
        <h1 className="mb-10 text-xl font-bold text-blue-900">
          Hospital MS
        </h1>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 border-t pt-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-gray-50 p-8">
        <Routes>
          {/* Doctor Dashboard */}
          <Route
            index
            element={
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Doctor Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                  Welcome, {user.firstName} {user.lastName}.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Total Appointments */}
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

                  {/* Completed Appointments */}
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

                  {/* Medical Records */}
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
            path="appointments"
            element={<DoctorAppointmentsPage />}
          />

          {/* Medical Records */}
          <Route
            path="medical-records"
            element={<DoctorMedicalRecordsPage />}
          />

          {/* Add Medical Record */}
          <Route
            path="add-medical-record"
            element={<DoctorAddMedicalRecordPage />}
          />

          {/* Invalid Routes */}
          <Route
            path="*"
            element={<Navigate to="/doctor" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}