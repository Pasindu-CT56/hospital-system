
import { useEffect, useState } from "react";

import {
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";

import toast from "react-hot-toast";

import StatCard from "../components/statCard.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    medicalRecords: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [
          patientsResponse,
          doctorsResponse,
          appointmentsResponse,
          recordsResponse,
        ] = await Promise.all([
          api.get("/patients", config),
          api.get("/doctors", config),
          api.get("/appointments", config),
          api.get("/medical-records", config),
        ]);

        setStats({
          patients:
            patientsResponse.data.patients?.length ?? 0,

          doctors:
            doctorsResponse.data.doctors?.length ?? 0,

          appointments:
            appointmentsResponse.data.appointments?.length ?? 0,

          medicalRecords:
            recordsResponse.data.medicalRecords?.length ?? 0,
        });
      } catch (error) {
        console.error("Dashboard data error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
          value={isLoading ? "..." : stats.patients}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="Total Doctors"
          value={isLoading ? "..." : stats.doctors}
          icon={Stethoscope}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Appointments"
          value={isLoading ? "..." : stats.appointments}
          icon={CalendarDays}
          color="bg-purple-100 text-purple-600"
        />

        <StatCard
          title="Medical Records"
          value={isLoading ? "..." : stats.medicalRecords}
          icon={FileText}
          color="bg-orange-100 text-orange-600"
        />
      </div>
    </div>
  );
}
