import React from 'react';

export default function HistoricalComparison({ comparison }) {
  if (!comparison || comparison.isFirstAnalysis) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800">✨ First Analysis</p>
        <p className="mt-1 text-sm text-green-700">This is the first analysis for this company. Future analyses will show improvements and trends.</p>
      </div>
    );
  }

  const {
    previousDate,
    currentDate,
    changes
  } = comparison;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div>
        <p className="text-sm font-semibold text-blue-800">📊 Comparison with Previous Analysis</p>
        <p className="mt-1 text-xs text-blue-700">
          Previous: {formatDate(previousDate)} | Current: {formatDate(currentDate)}
        </p>
      </div>

      {/* Risk Level Change */}
      {changes.riskLevel && (
        <div className="rounded bg-white p-3">
          <p className="text-xs font-semibold text-slate-600">RISK LEVEL</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Previous</p>
              <p className={`font-semibold ${
                changes.riskLevel.previous === 'High' ? 'text-red-600' :
                changes.riskLevel.previous === 'Medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {changes.riskLevel.previous}
              </p>
            </div>
            <div className="text-lg">{changes.riskLevel.improved ? '↓' : '↑'}</div>
            <div>
              <p className="text-xs text-slate-500">Current</p>
              <p className={`font-semibold ${
                changes.riskLevel.current === 'High' ? 'text-red-600' :
                changes.riskLevel.current === 'Medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {changes.riskLevel.current}
              </p>
            </div>
          </div>
          {changes.riskLevel.improved && (
            <p className="mt-2 text-xs text-green-700">✓ Risk level improved!</p>
          )}
        </div>
      )}

      {/* Health Score Change */}
      {changes.healthScore && (
        <div className="rounded bg-white p-3">
          <p className="text-xs font-semibold text-slate-600">HEALTH SCORE</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Previous</p>
              <p className="text-lg font-semibold text-slate-900">{changes.healthScore.previous}</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                changes.healthScore.change > 0 ? 'text-green-600' :
                changes.healthScore.change < 0 ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {changes.healthScore.change > 0 ? '+' : ''}{changes.healthScore.change}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current</p>
              <p className="text-lg font-semibold text-slate-900">{changes.healthScore.current}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Problems Reduction */}
      {changes.mainProblems && (
        <div className="rounded bg-white p-3">
          <p className="text-xs font-semibold text-slate-600">MAIN PROBLEMS</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Previous</p>
              <p className="text-lg font-semibold text-slate-900">{changes.mainProblems.previousCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">problems</p>
              <p className={`mt-1 text-sm font-bold ${
                changes.mainProblems.reducedProblems ? 'text-green-600' : 'text-orange-600'
              }`}>
                {changes.mainProblems.reducedProblems ? '↓' : '↑'} {changes.mainProblems.reductionPercentage}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current</p>
              <p className="text-lg font-semibold text-slate-900">{changes.mainProblems.currentCount}</p>
            </div>
          </div>
          {changes.mainProblems.reducedProblems && (
            <p className="mt-2 text-xs text-green-700">✓ Problem count decreased!</p>
          )}
        </div>
      )}

      <p className="text-xs text-blue-600 italic">
        Track your progress by analyzing regularly. Each new analysis provides insights into your recovery progress.
      </p>
    </div>
  );
}
