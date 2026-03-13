import { useEffect, useState } from 'react';

/**
 * Component to display comprehensive business analysis with charts and resources
 */
export default function AnalysisDetails({ analysis }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysis) {
    return <div className="text-center text-slate-500">No analysis data available</div>;
  }

  const getHealthScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Badge */}
      <div className={`rounded-lg p-4 ${getRiskColor(analysis.risk_level)}`}>
        <h3 className="font-semibold">Risk Level: {analysis.risk_level}</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'overview'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('projections')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'projections'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          12-Month Projections
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'benchmarks'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'training'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Training Resources
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Snapshot */}
          {analysis.financial_snapshot && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Financial Snapshot</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Cash Position</p>
                  <p className="text-slate-900">{analysis.financial_snapshot.current_cash_position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Monthly Burn Rate</p>
                  <p className="text-slate-900">{analysis.financial_snapshot.burn_rate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Runway</p>
                  <p className="text-slate-900">{analysis.financial_snapshot.runway_months} months</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Problems */}
          {analysis.main_problems && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Main Problems Identified</h3>
              <div className="space-y-4">
                {analysis.main_problems.map((problem, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{problem.problem}</p>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          problem.severity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : problem.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {problem.severity || 'Medium'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{problem.impact}</p>
                    <p className="mt-1 text-xs italic text-slate-500">{problem.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {analysis.success_metrics && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Key Performance Indicators</h3>
              <div className="space-y-4">
                {analysis.success_metrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{metric.kpi}</p>
                      <span className="text-xs text-slate-500">{metric.measurement_frequency}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Current</p>
                        <p className="font-semibold text-slate-900">{metric.current_value}</p>
                      </div>
                      <div className="text-slate-400">→</div>
                      <div>
                        <p className="text-xs text-slate-600">Target</p>
                        <p className="font-semibold text-green-600">{metric.target_value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          {/* Recovery Plan Timeline */}
          {analysis.recovery_plan && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Recovery Plan Timeline</h3>
              <div className="space-y-4">
                {analysis.recovery_plan.map((phase, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{phase.phase}</h4>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {phase.focus}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-600">ACTIONS</p>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {phase.actions && phase.actions.map((action, i) => (
                            <li key={i} className="text-sm text-slate-700">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 rounded bg-green-50 p-2">
                        <p className="text-xs font-semibold text-green-900">EXPECTED IMPACT</p>
                        <p className="text-sm text-green-900">{phase.expected_impact}</p>
                      </div>
                      {phase.success_metrics && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-slate-600">SUCCESS METRICS</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {phase.success_metrics.map((metric, i) => (
                              <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projections Chart */}
          {analysis.projections_12_months && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Financial Projections</h3>
              <div className="space-y-6">
                {/* Health Score Progression */}
                <div>
                  <p className="mb-3 font-medium text-slate-900">Health Score Progression</p>
                  <div className="flex items-end justify-between gap-4">
                    {[
                      { label: 'Month 3', value: analysis.projections_12_months.month_3.health_score },
                      { label: 'Month 6', value: analysis.projections_12_months.month_6.health_score },
                      { label: 'Month 12', value: analysis.projections_12_months.month_12.health_score },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="mb-2 h-32 w-12 rounded bg-gradient-to-t from-green-500 to-green-300"
                          style={{ height: `${item.value * 1.3}px` }}
                        />
                        <p className="text-xs font-semibold text-slate-900">{item.value}</p>
                        <p className="text-xs text-slate-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projections Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Period</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Revenue</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Debt</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Health Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(analysis.projections_12_months).map(([period, data]) => (
                        <tr key={period} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-900">
                            {period === 'month_3' ? 'Month 3' : period === 'month_6' ? 'Month 6' : 'Month 12'}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-700">${data.projected_revenue?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-slate-700">${data.projected_debt?.toLocaleString()}</td>
                          <td className={`px-4 py-2 text-right font-semibold ${getHealthScoreColor(data.health_score)}`}>
                            {data.health_score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Prioritized Recommendations</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{rec.recommendation}</h4>
                        <p className="mt-1 text-sm text-slate-600">{rec.responsible_team}</p>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          rec.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-600">Estimated ROI</p>
                        <p className="font-semibold text-green-600">{rec.estimated_roi}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Cost</p>
                        <p className="text-slate-900">{rec.implementation_cost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Timeline</p>
                        <p className="text-slate-900">{rec.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && analysis.industry_benchmarks && (
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="mb-4 text-lg font-semibold">Industry Benchmarks</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Profit Margin</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">Industry Average</p>
                  <p className="text-lg font-semibold text-slate-900">{analysis.industry_benchmarks.average_margin}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Your Company</p>
                  <p className="text-lg font-semibold text-orange-600">{analysis.industry_benchmarks.company_margin}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Debt-to-Revenue Ratio</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">Industry Standard</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {analysis.industry_benchmarks.debt_to_revenue_ratio_industry}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Your Company</p>
                  <p className="text-lg font-semibold text-red-600">{analysis.industry_benchmarks.company_debt_ratio}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Industry Growth Rate</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {analysis.industry_benchmarks.industry_growth_rate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Resources Tab */}
      {activeTab === 'training' && analysis.training_resources && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Recommended learning resources to improve your business skills and understand recovery strategies
          </p>
          {analysis.training_resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-200 p-4 transition hover:border-green-500 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{resource.resource_name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{resource.topic}</p>
                  <p className="mt-2 text-xs text-slate-500">{resource.relevance}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">{resource.provider}</span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{resource.duration}</span>
                    <span className={resource.cost === 'free' ? 'rounded bg-green-100 px-2 py-1 text-xs text-green-800' : 'rounded bg-orange-100 px-2 py-1 text-xs text-orange-800'}>
                      {resource.cost}
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-2xl">→</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
