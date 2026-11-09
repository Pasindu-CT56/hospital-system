import {
  NavLink,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  Receipt,
  LogOut,
} from "lucide-react";

import toast from "react-hot-toast";

import Dashboard from "./dashboardPage.jsx";
import AdminPatientsPage from "./adminPatientsPage.jsx";
import AdminPatientFormPage from "./adminPatientFormPage.jsx";
import AdminDoctorsPage from "./adminDoctorsPage.jsx";
import AdminDoctorFormPage from "./adminDoctorFormPage.jsx";
import AdminAppointmentsPage from "./adminAppointmentsPage.jsx";
import AdminAppointmentFormPage from "./adminAppointmentFormPage.jsx";
import AdminMedicalRecordsPage from "./adminMedicalRecordsPage.jsx";
import AdminMedicalRecordDetailsPage from "./adminMedicalRecordDetailsPage.jsx";
import AdminEditMedicalRecordPage from "./adminEditMedicalRecordPage.jsx";
import AdminBillingPage from "./adminBillingPage.jsx";
import AdminCreateInvoicePage from "./adminCreateInvoicePage.jsx";
import AdminInvoiceDetailsPage from "./adminInvoiceDetailsPage.jsx";

export default function AdminPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    if (user.role === "RECEPTIONIST") {
      return <Navigate to="/receptionist" replace />;
    }

    if (user.role === "DOCTOR") {
      return <Navigate to="/doctor" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  }

  const menuItems = [
    { title: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { title: "Patients", path: "/admin/patients", icon: Users },
    { title: "Doctors", path: "/admin/doctors", icon: Stethoscope },
    { title: "Appointments", path: "/admin/appointments", icon: CalendarDays },
    { title: "Medical Records", path: "/admin/medical-records", icon: FileText },
    { title: "Billing", path: "/admin/billing", icon: Receipt },
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
                <Icon size={19} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1 bg-gray-50 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="patients/add" element={<AdminPatientFormPage />} />
          <Route
            path="patients/edit/:patientId"
            element={<AdminPatientFormPage />}
          />

          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="doctors/add" element={<AdminDoctorFormPage />} />
          <Route
            path="doctors/edit/:doctorId"
            element={<AdminDoctorFormPage />}
          />

          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route
            path="appointments/add"
            element={<AdminAppointmentFormPage />}
          />
          <Route
            path="appointments/edit/:appointmentId"
            element={<AdminAppointmentFormPage />}
          />

          <Route
            path="medical-records"
            element={<AdminMedicalRecordsPage />}
          />
          <Route
            path="medical-records/edit/:recordId"
            element={<AdminEditMedicalRecordPage />}
          />
          <Route
            path="medical-records/:recordId"
            element={<AdminMedicalRecordDetailsPage />}
          />

          <Route path="billing" element={<AdminBillingPage />} />
          <Route
            path="billing/add"
            element={<AdminCreateInvoicePage />}
          />
          <Route
            path="billing/:invoiceId"
            element={<AdminInvoiceDetailsPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}