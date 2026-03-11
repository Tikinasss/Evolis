import { jsPDF } from "jspdf";

function ResultCard({ result }) {
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

  const handleExportPdf = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text("AI Business Rescue - Diagnostic", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Risk Level: ${result.risk_level || "Unknown"}`, 14, y);
    y += 8;

    const sections = [
      ["Main Problems", result.main_problems || []],
      ["Recovery Plan", result.recovery_plan || []],
      ["Recommendations", result.recommendations || []],
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

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">AI Recovery Diagnosis</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskColor}`}>
            Risk: {result.risk_level}
          </span>
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
        <section>
          <h4 className="font-semibold text-rescue-dark">Main Problems</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.main_problems || []).map((item, idx) => (
              <li key={`problem-${idx}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-rescue-dark">Recovery Plan</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.recovery_plan || []).map((item, idx) => (
              <li key={`plan-${idx}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-rescue-dark">Recommendations</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {(result.recommendations || []).map((item, idx) => (
              <li key={`recommendation-${idx}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ResultCard;
