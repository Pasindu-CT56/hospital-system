
function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon size={24} className="text-blue-600" />
      </div>

      <h2 className="mt-4 text-3xl font-bold text-gray-800">
        {value}
      </h2>
    </div>
  );
}

export default StatCard;
