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

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">AI Recovery Diagnosis</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskColor}`}>
          Risk: {result.risk_level}
        </span>
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
