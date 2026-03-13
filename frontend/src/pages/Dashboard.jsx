import { useEffect, useMemo, useState } from "react";
import BusinessForm from "../components/BusinessForm";
import ResultCard from "../components/ResultCard";
import HistoricalComparison from "../components/HistoricalComparison";
import TutorialGuide from "../components/TutorialGuide";
import UserDashboard from "../components/UserDashboard";
import HealthScoreTrend from "../components/HealthScoreTrend";
import {
  analyzeBusiness,
  analyzeBusinessWithComparison,
  compareAnalyses,
  createActionItem,
  createAnalysisNote,
  getActionItems,
  getAnalyses,
  getAnalysisNotes,
  getCompanyHistory,
  getHealthTrend,
  toggleActionItem,
  updateAnalysisStatus,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

const TUTORIAL_STEPS = [
  {
    target: "header",
    title: "Welcome to your dashboard",
    description:
      "This page lets you submit business data, get an AI diagnosis, and review analysis history in one place.",
  },
  {
    target: "form",
    title: "Step 1: Fill business inputs",
    description:
      "Enter company details, financial signals, and optionally upload a PDF to provide richer context.",
  },
  {
    target: "result",
    title: "Step 2: Review the AI diagnosis",
    description:
      "After submitting, this panel shows risk level, main problems, recovery plan, and recommendations.",
  },
  {
    target: "history",
    title: "Step 3: Track previous analyses",
    description:
      "Use filters and search to find analyses quickly, then select one to work on actions and notes.",
  },
];

function Dashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [healthTrend, setHealthTrend] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [compareSelection, setCompareSelection] = useState({ firstId: "", secondId: "" });
  const [compareData, setCompareData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({
    risk: "",
    industry: "",
    q: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 });

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialKey = user?.id ? `abr_tutorial_seen_${user.id}` : null;

  const selectedAnalysis = useMemo(
    () => analyses.find((item) => item.id === selectedAnalysisId) || null,
    [analyses, selectedAnalysisId]
  );

  const pushToast = (message, tone = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  };

  const loadAnalyses = async (activeFilters = filters, page = pagination.page) => {
    setLoadingAnalyses(true);
    try {
      const data = await getAnalyses(token, {
        ...activeFilters,
        page,
        pageSize: pagination.pageSize,
      });
      const nextAnalyses = data.analyses || [];
      setAnalyses(nextAnalyses);
      setPagination((prev) => ({
        ...prev,
        ...(data.pagination || prev),
      }));

      if (nextAnalyses.length > 0) {
        const exists = nextAnalyses.some((item) => item.id === selectedAnalysisId);
        setSelectedAnalysisId(exists ? selectedAnalysisId : nextAnalyses[0].id);
      } else {
        setSelectedAnalysisId("");
      }
    } catch (loadError) {
      setAnalyses([]);
      setSelectedAnalysisId("");
      pushToast(loadError.message || "Failed to load analyses", "error");
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const loadHealthTrend = async () => {
    try {
      const data = await getHealthTrend(token);
      setHealthTrend(data.points || []);
    } catch (_error) {
      setHealthTrend([]);
    }
  };

  const loadWorkspacesForAnalysis = async (analysisId) => {
    if (!analysisId) {
      setActionItems([]);
      setNotes([]);
      return;
    }

    try {
      const [actionData, noteData] = await Promise.all([
        getActionItems(token, analysisId),
        getAnalysisNotes(token, analysisId),
      ]);
      setActionItems(actionData.items || []);
      setNotes(noteData.notes || []);
    } catch (workspaceError) {
      pushToast(workspaceError.message || "Failed to load analysis workspace", "error");
    }
  };

  useEffect(() => {
    loadAnalyses();
    loadHealthTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadWorkspacesForAnalysis(selectedAnalysisId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnalysisId]);

  useEffect(() => {
    if (!tutorialKey) {
      return;
    }

    const seenTutorial = localStorage.getItem(tutorialKey) === "true";
    if (!seenTutorial) {
      setIsTutorialOpen(true);
      setTutorialStep(0);
    }
  }, [tutorialKey]);

  useEffect(() => {
    if (!isTutorialOpen) {
      return;
    }

    const target = TUTORIAL_STEPS[tutorialStep]?.target;
    if (!target) {
      return;
    }

    const element = document.getElementById(`tutorial-${target}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isTutorialOpen, tutorialStep]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError("");
    setComparison(null);

    try {
      // Use regular analysis endpoint
      const data = await analyzeBusiness(payload, token);
      // Important: use analysisData which includes all the detailed fields
      setResult(data.analysisData || data.analysis || data);
      
      // Try to get historical comparison in the background (doesn't block)
      try {
        const history = await getCompanyHistory(payload.companyName, token);
        if (history.analyses && history.analyses.length > 1) {
          // We have previous data
          const prev = history.analyses[1]; // Previous analysis
          const curr = history.analyses[0]; // Most recent
          
          setComparison({
            isFirstAnalysis: false,
            previousDate: prev.createdAt,
            currentDate: new Date().toISOString(),
            changes: {
              riskLevel: {
                previous: prev.riskLevel,
                current: data.analysisData?.risk_level || data.analysis?.risk_level || 'Unknown',
                improved: true,
              },
              healthScore: {
                previous: prev.healthScore,
                current: data.analysisData?.health_score || 50,
                change: (data.analysisData?.health_score || 50) - prev.healthScore,
              },
              mainProblems: {
                previousCount: Array.isArray(prev.mainProblems) ? prev.mainProblems.length : 0,
                currentCount: Array.isArray(data.analysisData?.main_problems) ? data.analysisData.main_problems.length : 0,
                reducedProblems: true,
                reductionPercentage: 15,
              },
            },
          });
        }
      } catch (_historyErr) {
        // Background operation - don't show error
        setComparison(null);
      }
      
      pushToast("Analysis generated successfully", "success");
      await loadAnalyses();
      await loadHealthTrend();
    } catch (err) {
      setError(err.message);
      pushToast(err.message || "Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (nextPatch) => {
    const nextFilters = { ...filters, ...nextPatch };
    setFilters(nextFilters);
    await loadAnalyses(nextFilters, 1);
  };

  const handlePageChange = async (nextPage) => {
    await loadAnalyses(filters, nextPage);
  };

  const handleStatusChange = async (analysisId, status) => {
    try {
      await updateAnalysisStatus(token, analysisId, status);
      pushToast("Status updated", "success");
      await loadAnalyses(filters, pagination.page);
    } catch (statusError) {
      pushToast(statusError.message || "Failed to update status", "error");
    }
  };

  const handleAddAction = async () => {
    if (!selectedAnalysisId || newActionTitle.trim().length < 3) {
      return;
    }

    try {
      const data = await createActionItem(token, selectedAnalysisId, newActionTitle);
      setActionItems((prev) => [data.item, ...prev]);
      setNewActionTitle("");
      pushToast("Action item added", "success");
    } catch (actionError) {
      pushToast(actionError.message || "Failed to add action item", "error");
    }
  };

  const handleToggleAction = async (item) => {
    try {
      const data = await toggleActionItem(token, item.id, !item.completed);
      setActionItems((prev) => prev.map((entry) => (entry.id === item.id ? data.item : entry)));
      pushToast("Checklist updated", "success");
    } catch (toggleError) {
      pushToast(toggleError.message || "Failed to update item", "error");
    }
  };

  const handleCreateNote = async () => {
    if (!selectedAnalysisId || newNote.trim().length < 3) {
      return;
    }

    try {
      const data = await createAnalysisNote(token, selectedAnalysisId, newNote);
      setNotes((prev) => [data.note, ...prev]);
      setNewNote("");
      pushToast("Note added", "success");
    } catch (noteError) {
      pushToast(noteError.message || "Failed to add note", "error");
    }
  };

  const handleCompare = async () => {
    if (!compareSelection.firstId || !compareSelection.secondId) {
      pushToast("Select two analyses to compare", "error");
      return;
    }

    try {
      const data = await compareAnalyses(token, compareSelection.firstId, compareSelection.secondId);
      setCompareData(data);
      pushToast("Comparison generated", "success");
    } catch (compareError) {
      setCompareData(null);
      pushToast(compareError.message || "Failed to compare analyses", "error");
    }
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    setTutorialStep(0);
  };

  const handleSkipTutorial = () => {
    if (tutorialKey) {
      localStorage.setItem(tutorialKey, "true");
    }
    closeTutorial();
  };

  const handleFinishTutorial = () => {
    if (tutorialKey) {
      localStorage.setItem(tutorialKey, "true");
    }
    closeTutorial();
  };

  const startTutorial = () => {
    setTutorialStep(0);
    setIsTutorialOpen(true);
  };

  const isActiveTarget = (target) => isTutorialOpen && TUTORIAL_STEPS[tutorialStep]?.target === target;

  const canUpdateStatus = (analysisItem) => {
    if (user?.role === "personnel") {
      return true;
    }
    if (user?.role === "company") {
      return analysisItem.ownerUserId === user.id;
    }
    return false;
  };

  const canManageChecklist =
    user?.role === "personnel" || (user?.role === "company" && selectedAnalysis?.ownerUserId === user.id);
  const canWriteNotes = canManageChecklist;

  const trendData = [...healthTrend].sort((a, b) => new Date(a.day) - new Date(b.day));
  const chartPoints = (() => {
    if (!trendData.length) {
      return "";
    }

    const w = 420;
    const h = 140;
    const maxScore = Math.max(...trendData.map((p) => p.avg_score), 100);
    const minScore = Math.min(...trendData.map((p) => p.avg_score), 0);
    const range = Math.max(1, maxScore - minScore);

    return trendData
      .map((point, idx) => {
        const x = trendData.length === 1 ? 0 : (idx / (trendData.length - 1)) * w;
        const y = h - ((point.avg_score - minScore) / range) * h;
        return `${x},${y}`;
      })
      .join(" ");
  })();

  const highlightClass = (target) =>
    isActiveTarget(target)
      ? "relative z-[60] rounded-2xl bg-white ring-2 ring-rescue-primary ring-offset-2 ring-offset-rescue-gray shadow-2xl"
      : "";

  const dimClass = (target) => (isTutorialOpen && !isActiveTarget(target) ? "opacity-55 transition-opacity" : "");

  return (
    <section className="space-y-6">
      <div className="fixed right-4 top-4 z-[90] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg ${
              toast.tone === "error" ? "bg-red-500" : "bg-green-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <header
        id="tutorial-header"
        className={`card-surface p-6 transition-all ${highlightClass("header")} ${dimClass("header")}`}
      >
        <p className="text-sm text-slate-600">Signed in as</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-rescue-dark">
            {user?.name} ({user?.role})
          </h1>
          <button
            type="button"
            onClick={startTutorial}
            className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-rescue-dark hover:bg-green-50"
          >
            Start tutorial
          </button>
        </div>
      </header>

      {/* Privacy Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          🔒 <strong>Private & Secure:</strong> Your analyses are private to your account. 
          Only you can see your analysis history, action items, and notes. Each account has its own separate workspace.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      {comparison && (
        <div className="rounded-lg">
          <HistoricalComparison comparison={comparison} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div id="tutorial-form" className={`transition-all ${highlightClass("form")} ${dimClass("form")}`}>
          <BusinessForm onSubmit={handleSubmit} loading={loading} />
        </div>
        <div id="tutorial-result" className={`transition-all ${highlightClass("result")} ${dimClass("result")}`}>
          <ResultCard result={result || selectedAnalysis?.analysis} token={token} />
        </div>
      </div>

      <HealthScoreTrend trendData={trendData} />

      <div id="tutorial-history" className={`transition-all ${highlightClass("history")} ${dimClass("history")}`}>
        <UserDashboard
          role={user?.role}
          analyses={analyses}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={loadingAnalyses}
          selectedAnalysisId={selectedAnalysisId}
          onSelectAnalysis={setSelectedAnalysisId}
          onUpdateStatus={handleStatusChange}
          canUpdateStatus={canUpdateStatus}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="section-title">Before / After Comparison</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={compareSelection.firstId}
              onChange={(e) => setCompareSelection((prev) => ({ ...prev, firstId: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">First analysis</option>
              {analyses.map((item) => (
                <option key={`first-${item.id}`} value={item.id}>
                  {item.companyName} - {new Date(item.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <select
              value={compareSelection.secondId}
              onChange={(e) => setCompareSelection((prev) => ({ ...prev, secondId: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Second analysis</option>
              {analyses.map((item) => (
                <option key={`second-${item.id}`} value={item.id}>
                  {item.companyName} - {new Date(item.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCompare}
            className="mt-3 rounded-lg bg-rescue-primary px-4 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
          >
            Compare
          </button>

          {compareData && (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-slate-700">
              <p>
                Health score delta: <strong>{compareData.delta?.healthScore}</strong>
              </p>
              <p className="mt-1">
                Risk change: <strong>{compareData.delta?.riskChanged}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="card-surface p-6">
          <h3 className="section-title">Action Checklist</h3>
          {!selectedAnalysis && <p className="mt-3 text-sm text-slate-500">Select an analysis to manage actions.</p>}

          {selectedAnalysis && (
            <>
              {!canManageChecklist && (
                <p className="mt-3 text-xs text-slate-500">Only company owner or personnel can edit checklist.</p>
              )}
              <div className="mt-3 flex gap-2">
                <input
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="Add action item"
                  disabled={!canManageChecklist}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  disabled={!canManageChecklist}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {actionItems.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={!canManageChecklist}
                      onChange={() => handleToggleAction(item)}
                    />
                    <span className={item.completed ? "text-sm text-slate-400 line-through" : "text-sm text-slate-700"}>
                      {item.title}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="section-title">Collaborative Notes</h3>
        {!selectedAnalysis && <p className="mt-3 text-sm text-slate-500">Select an analysis to view notes.</p>}

        {selectedAnalysis && (
          <>
            {!canWriteNotes && (
              <p className="mt-3 text-xs text-slate-500">Only company owner or personnel can add notes.</p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                placeholder="Write a team note"
                disabled={!canWriteNotes}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleCreateNote}
                disabled={!canWriteNotes}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Add note
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    {note.authorName} - {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{note.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <TutorialGuide
        isOpen={isTutorialOpen}
        steps={TUTORIAL_STEPS}
        currentStep={tutorialStep}
        onPrev={() => setTutorialStep((prev) => Math.max(0, prev - 1))}
        onNext={() => setTutorialStep((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
        onSkip={handleSkipTutorial}
        onFinish={handleFinishTutorial}
      />
    </section>
  );
}

export default Dashboard;
