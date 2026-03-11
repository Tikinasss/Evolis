function UserDashboard({
  role,
  analyses,
  filters,
  onFiltersChange,
  loading,
  selectedAnalysisId,
  onSelectAnalysis,
  onUpdateStatus,
  canUpdateStatus,
  pagination,
  onPageChange,
}) {
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

      <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <input
          value={filters.q}
          onChange={(e) => onFiltersChange({ q: e.target.value })}
          placeholder="Search company"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        />
        <select
          value={filters.risk}
          onChange={(e) => onFiltersChange({ risk: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="">All risks</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          value={filters.industry}
          onChange={(e) => onFiltersChange({ industry: e.target.value })}
          placeholder="Industry"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        />
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <input
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
          type="date"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        />
        <input
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
          type="date"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loading && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">Loading analyses...</p>}

        {!loading && analyses.length === 0 && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-rescue-dark">No analyses available yet.</p>
        )}

        {analyses.map((item) => {
          const selected = selectedAnalysisId === item.id;
          const status = item.status || "completed";

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition ${
                selected ? "border-rescue-primary bg-green-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectAnalysis(item.id)}
                  className="text-left"
                >
                  <p className="font-semibold text-slate-800">{item.companyName}</p>
                  <p className="text-sm text-slate-500">
                    {item.industry} - {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-rescue-dark">
                    {item.analysis?.risk_level || "Unknown"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    Score {item.healthScore ?? "-"}
                  </span>
                  <select
                    value={status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                    disabled={!canUpdateStatus(item)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Page {pagination.page} / {pagination.totalPages} - {pagination.total} analyses
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
