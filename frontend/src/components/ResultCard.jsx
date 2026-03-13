import { useState, useEffect } from "react";
import AnalysisDetails from "./AnalysisDetails";
import NotesPanel from "./NotesPanel";
import ExportPanel from "./ExportPanel";
import { getAnalysisNotes } from "../api/client";

function ResultCard({ result, token }) {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (token && result?.id) {
      loadNotes();
    }
  }, [result?.id, token]);

  const loadNotes = async () => {
    if (!token || !result?.id) return;
    try {
      const response = await getAnalysisNotes(token, result.id);
      if (response.success) {
        setNotes(response.notes || []);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  };

  if (!result) {
    return (
      <div className="card-surface p-6 text-slate-600">
        Submit business data to get an AI-powered recovery strategy.
      </div>
    );
  }

  const riskColor =
    result.risk_level === "High"
      ? "bg-red-100 text-red-700"
      : result.risk_level === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-rescue-dark";

  // Check if result has new detailed structure
  const hasDetailedStructure =
    result.financial_snapshot ||
    result.projections_12_months ||
    result.training_resources ||
    (Array.isArray(result.main_problems) &&
      result.main_problems.length > 0 &&
      typeof result.main_problems[0] === "object" &&
      result.main_problems[0]?.problem);
    let y = 20;

    doc.setFontSize(16);
    doc.text("AI Business Rescue - Diagnostic", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Risk Level: ${result.risk_level || "Unknown"}`, 14, y);
    y += 8;

    // Handle both old and new data formats
    const mainProblems = Array.isArray(result.main_problems)
      ? result.main_problems.map((item) =>
          typeof item === "string" ? item : `${item.problem || "Unknown"}: ${item.impact || ""}`
        )
      : [];

    const recoveryPlan = Array.isArray(result.recovery_plan)
      ? result.recovery_plan.map((item) =>
          typeof item === "string"
            ? item
            : `${item.phase || "Phase"} - ${item.focus || ""}: ${(item.actions || []).join(", ")}`
        )
      : [];

    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations.map((item) =>
          typeof item === "string" ? item : `${item.recommendation || "Unknown"} (ROI: ${item.estimated_roi || "N/A"})`
        )
      : [];

    const sections = [
      ["Main Problems", mainProblems],
      ["Recovery Plan", recoveryPlan],
      ["Recommendations", recommendations],
    ];

    for (const [title, items] of sections) {
      doc.setFont(undefined, "bold");
      doc.text(title, 14, y);
      y += 7;
      doc.setFont(undefined, "normal");

      if (!items.length) {
        doc.text("- No item", 16, y);
        y += 6;
      } else {
        items.forEach((item) => {
          const lines = doc.splitTextToSize(`- ${item}`, 180);
          doc.text(lines, 16, y);
          y += lines.length * 6;
        });
      }

      y += 2;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save("business-recovery-diagnostic.pdf");
  };

  // If detailed structure, show enhanced view
  if (hasDetailedStructure && showDetailedView) {
    return (
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Analyse Complète</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailedView(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Vue Simple
            </button>
            <ExportPanel result={result} notes={notes} />
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <AnalysisDetails analysis={result} />
        </div>

        {result.id && token && (
          <NotesPanel analysisId={result.id} token={token} />
        )}
      </div>
    );
  }

  // Default simple view (works with both formats)
  return (
    <div className="card-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title">🏥 Diagnostic de Récupération</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskColor}`}>
            Risque: {result.risk_level}
          </span>
          {hasDetailedStructure && (
            <button
              type="button"
              onClick={() => setShowDetailedView(true)}
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              📊 Analyse Complète
            </button>
          )}
          <ExportPanel result={result} notes={notes} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Problems Section */}
        <section>
          <h4 className="font-semibold text-rescue-dark">🔴 Problèmes Principaux</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.main_problems || []).map((item, idx) => {
              const text =
                typeof item === "string"
                  ? item
                  : `${item.problem || "Inconnu"} - Sévérité: ${item.severity || "Moyenne"}`;
              return (
                <li key={`problem-${idx}`} className="text-sm">
                  {text}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Recovery Plan Section */}
        <section>
          <h4 className="font-semibold text-rescue-dark">📋 Plan de Récupération</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.recovery_plan || []).map((item, idx) => {
              const text =
                typeof item === "string" ? item : `${item.phase || "Phase"} - ${item.focus || ""}`;
              return (
                <li key={`plan-${idx}`} className="text-sm">
                  {text}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Recommendations Section */}
        <section>
          <h4 className="font-semibold text-rescue-dark">💡 Recommandations</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.recommendations || []).map((item, idx) => {
              const text =
                typeof item === "string"
                  ? item
                  : `${item.recommendation || "Inconnu"} (Priorité: ${item.priority || "Moyenne"})`;
              return (
                <li key={`recommendation-${idx}`} className="text-sm">
                  {text}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Notes Section for simple view */}
      {result.id && token && (
        <NotesPanel analysisId={result.id} token={token} />
      )}
    </div>
  );
}

export default ResultCard;
