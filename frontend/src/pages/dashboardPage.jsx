import {
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";

import StatCard from "../components/statCard.jsx";

export default function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome to Hospital Management System
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Patients"
          value="120"
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="Total Doctors"
          value="15"
          icon={Stethoscope}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Appointments"
          value="45"
          icon={CalendarDays}
          color="bg-purple-100 text-purple-600"
        />

        <StatCard
          title="Medical Records"
          value="85"
          icon={FileText}
          color="bg-orange-100 text-orange-600"
        />

      </div>
    </div>
  );
}