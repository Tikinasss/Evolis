import { useState } from "react";
import { jsPDF } from "jspdf";

/**
 * Format large numbers with appropriate units (Billions, Millions, etc.)
 */
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A';
  const num = Math.abs(Number(value));
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)} milliards USD`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} millions USD`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K USD`;
  } else {
    return `${num.toFixed(0)} USD`;
  }
};

function ExportPanel({ result, notes = [] }) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportDetails, setExportDetails] = useState("full");
  const [showMenu, setShowMenu] = useState(false);

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

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 80);
    doc.text("AI Business Rescue - Complete Diagnostic", 14, y);
    y += 15;

    // Company and metadata
    if (result.company_name) {
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Company: ${result.company_name}`, 14, y);
      y += 6;
    }

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString("en-US")}`, 14, y);
    y += 8;

    // Risk Level
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text(`Risk Level: ${result.risk_level || "Unknown"}`, 14, y);
    y += 10;

    // Helper function to add sections
    const addSection = (title, items, maxWidth = 180) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(40, 40, 80);
      doc.text(title, 14, y);
      y += 8;

      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      if (!items || items.length === 0) {
        doc.setTextColor(150, 150, 150);
        doc.text("No items", 16, y);
        y += 6;
      } else {
        items.forEach((item) => {
          const lines = doc.splitTextToSize(`• ${item}`, maxWidth);
          doc.text(lines, 16, y);
          y += lines.length * 5 + 1;
        });
      }

      y += 4;
    };

    // Main Problems
    if (exportDetails === "full") {
      const mainProblems = Array.isArray(result.main_problems)
        ? result.main_problems.map((item) =>
            typeof item === "string"
              ? item
              : `${item.problem || "Unknown"} (${item.severity || "Medium"}) - Impact: ${item.impact || "Not specified"}`
          )
        : [];

      addSection("Main Problems", mainProblems);

      // Financial data with emoji indicators
      const finData = result.financial_snapshot || {};
      const finItems = [
        `🏥 Health Score: ${finData.health_score || 'N/A'}/100`,
        ...(finData.debt_ratio ? [`📉 Debt Ratio: ${finData.debt_ratio}`] : []),
        ...(finData.cash_flow ? [`💵 Cash Flow: ${formatCurrency(finData.cash_flow)}`] : []),
        ...(finData.operating_margin ? [`🎯 Operating Margin: ${finData.operating_margin}%`] : []),
        ...(finData.current_cash_position ? [`💰 Cash Position: ${formatCurrency(finData.current_cash_position)}`] : []),
      ];
      addSection("Complete Financial Overview", finItems);

      // Recovery Plan
      const recoveryPlan = Array.isArray(result.recovery_plan)
        ? result.recovery_plan.map((item) =>
            typeof item === "string"
              ? item
              : `${item.phase || "Phase"} - ${item.focus || ""}: ${(item.actions || []).join(", ")}` 
          )
        : [];

      addSection("Recovery Plan", recoveryPlan);

      // Projections
      if (result.projections_12_months && Array.isArray(result.projections_12_months)) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        const projectionItems = result.projections_12_months.map(
          (p) => {
            const items = [];
            if (p.month !== undefined) items.push(`Month ${p.month}`);
            if (p.health_score !== undefined) items.push(`Health: ${p.health_score}/100`);
            if (p.revenue !== undefined) items.push(`Revenue: ${formatCurrency(p.revenue)}`);
            if (p.debt !== undefined) items.push(`Debt: ${formatCurrency(p.debt)}`);
            return items.join(" | ");
          }
        );
        addSection("📊 12-Month Projections", projectionItems);
      }

      // Recommendations
      const recommendations = Array.isArray(result.recommendations)
        ? result.recommendations.map((item) =>
            typeof item === "string"
              ? item
              : `${item.recommendation || "Unknown"} (Priority: ${item.priority || "Medium"}, ROI: ${item.estimated_roi || "N/A"})`
          )
        : [];

      addSection("Recommendations", recommendations);

      // Industry Benchmarks
      if (result.industry_benchmarks) {
        const benchItems = [
          `Industry Average Profit Margin: ${result.industry_benchmarks.avg_profit_margin || "N/A"}%`,
          `Industry Average Debt Ratio: ${result.industry_benchmarks.avg_debt_ratio || "N/A"}`,
          `Industry Growth Rate: ${result.industry_benchmarks.growth_rate || "N/A"}%`,
        ];
        addSection("Industry Benchmarks", benchItems);
      }

      // Training Resources
      if (result.training_resources && Array.isArray(result.training_resources)) {
        const trainingItems = result.training_resources.map(
          (t) => `${t.title} (${t.provider}) - ${t.duration} - ${t.cost || "Free"}`
        );
        addSection("Training Resources", trainingItems);
      }
    } else {
      // Simple version
      const mainProblems = Array.isArray(result.main_problems)
        ? result.main_problems.map((item) =>
            typeof item === "string" ? item : `${item.problem || "Unknown"}`
          )
        : [];

      addSection("Main Problems", mainProblems);

      const recoveryPlan = Array.isArray(result.recovery_plan)
        ? result.recovery_plan.map((item) =>
            typeof item === "string" ? item : `${item.phase || "Phase"} - ${item.focus || ""}`
          )
        : [];

      addSection("Recovery Plan", recoveryPlan);

      const recommendations = Array.isArray(result.recommendations)
        ? result.recommendations.map((item) =>
            typeof item === "string" ? item : `${item.recommendation || "Unknown"}`
          )
        : [];

      addSection("Recommendations", recommendations);
    }

    // Notes
    if (notes && notes.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(40, 40, 80);
      doc.text("Analysis Notes", 14, y);
      y += 8;

      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      notes.forEach((note, idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        const noteDate = new Date(note.createdAt).toLocaleDateString("en-US");
        doc.setFont(undefined, "bold");
        doc.setTextColor(60, 60, 120);
        doc.text(`${note.authorName} - ${noteDate}`, 16, y);
        y += 4;

        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(note.content, 175);
        doc.text(lines, 16, y);
        y += lines.length * 4 + 2;
      });
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `© 2026 Evolis AI - Document generated on ${new Date().toLocaleDateString("en-US")}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`diagnostic-${result.company_name || "analyse"}-${Date.now()}.pdf`);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      >
        📥 Export
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Detail Level:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="full"
                    checked={exportDetails === "full"}
                    onChange={(e) => setExportDetails(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Full version</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="simple"
                    checked={exportDetails === "simple"}
                    onChange={(e) => setExportDetails(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Summary version</span>
                </label>
              </div>
            </div>

            {hasDetailedStructure && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2">
                <span className="text-sm text-green-700">
                  ✓ Detailed version available
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full rounded-lg bg-rescue-main px-3 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
            >
              🔄 Export to PDF
            </button>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportPanel;
