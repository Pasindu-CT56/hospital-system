
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Patients", icon: Users },
  { name: "Doctors", icon: Stethoscope },
  { name: "Appointments", icon: CalendarDays },
  { name: "Medical Records", icon: FileText },
];

function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-blue-900 p-5 text-white">
      <h1 className="mb-10 text-2xl font-bold">Hospital MS</h1>

      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 ${
                index === 0
                  ? "bg-blue-600"
                  : "text-blue-100 hover:bg-blue-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
