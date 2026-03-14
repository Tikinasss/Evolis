import { useState, useEffect } from "react";
import { getActionItems, createActionItem, toggleActionItem } from "../api/client";

function ActionChecklist({ analysisId, token }) {
  const [actions, setActions] = useState([]);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActions();
  }, [analysisId, token]);

  const loadActions = async () => {
    if (!token || !analysisId) return;

    setLoading(true);
    try {
      const response = await getActionItems(token, analysisId);
      setActions(response.items || []);
    } catch (err) {
      console.error("Failed to load actions:", err);
      setError("Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !token) return;

    setSubmitting(true);
    try {
      const response = await createActionItem(token, analysisId, newActionTitle.trim());
      setActions([response.item, ...actions]);
      setNewActionTitle("");
      setError(null);
    } catch (err) {
      console.error("Failed to create action:", err);
      setError(err.message || "Error adding action");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAction = async (action) => {
    try {
      const response = await toggleActionItem(token, action.id, !action.completed);
      setActions(
        actions.map((item) =>
          item.id === action.id ? response.item : item
        )
      );
    } catch (err) {
      console.error("Failed to toggle action:", err);
      setError(err.message || "Error updating action");
    }
  };

  const completedCount = actions.filter((a) => a.completed).length;
  const progress = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-rescue-dark">✅ Action Plan</h4>
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-slate-600">
              {completedCount}/{actions.length}
            </div>
            <div className="h-2 w-24 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Action Form */}
      <form onSubmit={handleAddAction} className="space-y-2">
        <div className="flex gap-2">
          <input
            value={newActionTitle}
            onChange={(e) => setNewActionTitle(e.target.value)}
            placeholder="Add an action..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-rescue-main focus:outline-none"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newActionTitle.trim() || submitting}
            className="rounded-lg bg-rescue-main px-3 py-2 text-xs font-semibold text-white hover:bg-rescue-dark disabled:bg-slate-300"
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading actions...</p>
        ) : actions.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No actions yet. Create one to start!
          </p>
        ) : (
          actions.map((action) => (
            <label
              key={action.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={action.completed}
                onChange={() => handleToggleAction(action)}
                className="h-4 w-4 rounded cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  action.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-700 font-medium"
                }`}
              >
                {action.title}
              </span>
              {action.completed && <span className="text-xs text-green-600">✓ Completed</span>}
            </label>
          ))
        )}
      </div>

      {/* Progress Summary */}
      {actions.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-semibold">
            📊 Progress: {completedCount} action(s) completed out of {actions.length}
            {progress === 100 && " 🎉"}
          </p>
        </div>
      )}
    </div>
  );
}

export default ActionChecklist;
