import { useState } from "react";
import { jsPDF } from "jspdf";
import AnalysisDetails from "./AnalysisDetails";

function ResultCard({ result }) {
  const [showDetailedView, setShowDetailedView] = useState(false);

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

  const handleExportPdf = () => {
    const doc = new jsPDF();
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
      <div className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title">Complete Recovery Analysis</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailedView(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Simple View
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          <AnalysisDetails analysis={result} />
        </div>
      </div>
    );
  }

  // Default simple view (works with both formats)
  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">AI Recovery Diagnosis</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskColor}`}>
            Risk: {result.risk_level}
          </span>
          {hasDetailedStructure && (
            <button
              type="button"
              onClick={() => setShowDetailedView(true)}
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              Full Analysis
            </button>
          )}
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Problems Section */}
        <section>
          <h4 className="font-semibold text-rescue-dark">Main Problems</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.main_problems || []).map((item, idx) => {
              const text =
                typeof item === "string"
                  ? item
                  : `${item.problem || "Unknown"} - ${item.severity || "Medium"} severity`;
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
          <h4 className="font-semibold text-rescue-dark">Recovery Plan</h4>
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
          <h4 className="font-semibold text-rescue-dark">Recommendations</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.recommendations || []).map((item, idx) => {
              const text =
                typeof item === "string"
                  ? item
                  : `${item.recommendation || "Unknown"} (Priority: ${item.priority || "Medium"})`;
              return (
                <li key={`recommendation-${idx}`} className="text-sm">
                  {text}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ResultCard;
