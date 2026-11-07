
import {
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";

import StatCard from "../components/statCard.jsx";

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">
        Dashboard
      </h2>

      <p className="mt-1 text-gray-500">
        Welcome to Hospital Management System
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Patients" value="0" icon={Users} />
        <StatCard title="Total Doctors" value="0" icon={Stethoscope} />
        <StatCard title="Appointments" value="0" icon={CalendarDays} />
        <StatCard title="Medical Records" value="0" icon={FileText} />
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">
          Hospital Management System
        </h3>

        <p className="mt-2 text-gray-500">
          Manage patients, doctors, appointments and medical records
          from one place.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
