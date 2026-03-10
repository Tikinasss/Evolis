function UserDashboard({ role, analyses }) {
  const roleTitle =
    role === "personnel"
      ? "Personnel Dashboard"
      : role === "company"
      ? "Company Dashboard"
      : "Employee Dashboard";

  const roleDescription =
    role === "personnel"
      ? "You can review all analyses across all companies."
      : role === "company"
      ? "You can manage and track analyses for your company account."
      : "You can access analysis summaries that are shared with employees.";

  return (
    <div className="card-surface p-6">
      <h3 className="section-title">{roleTitle}</h3>
      <p className="mt-2 text-sm text-slate-600">{roleDescription}</p>

      <div className="mt-5 space-y-3">
        {analyses.length === 0 && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-rescue-dark">No analyses available yet.</p>
        )}

        {analyses.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{item.companyName}</p>
                <p className="text-sm text-slate-500">
                  {item.industry} - {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-rescue-dark">
                {item.analysis?.risk_level || "Unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;
