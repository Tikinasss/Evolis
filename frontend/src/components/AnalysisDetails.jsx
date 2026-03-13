import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
          {analysis.main_problems && Array.isArray(analysis.main_problems) && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Main Problems Identified</h3>
              <div className="space-y-4">
                {analysis.main_problems.map((problem, idx) => {
                  // Handle both object and string formats
                  const problemObj = typeof problem === 'string' ? { problem, severity: 'Medium' } : problem;
                  return (
                    <div key={`problem-${idx}-${problemObj.problem || idx}`} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{problemObj.problem || 'Unknown Problem'}</p>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            problemObj.severity === 'High'
                              ? 'bg-red-100 text-red-800'
                              : problemObj.severity === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {problemObj.severity || 'Medium'}
                        </span>
                      </div>
                      {problemObj.impact && <p className="mt-1 text-sm text-slate-600">{problemObj.impact}</p>}
                      {problemObj.evidence && <p className="mt-1 text-xs italic text-slate-500">{problemObj.evidence}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {analysis.success_metrics && Array.isArray(analysis.success_metrics) && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Key Performance Indicators</h3>
              <div className="space-y-4">
                {analysis.success_metrics.map((metric, idx) => (
                  <div key={`metric-${idx}-${metric.kpi || idx}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{metric.kpi || 'KPI'}</p>
                      <span className="text-xs text-slate-500">{metric.measurement_frequency || 'monthly'}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Current</p>
                        <p className="font-semibold text-slate-900">{metric.current_value || 'N/A'}</p>
                      </div>
                      <div className="text-slate-400">→</div>
                      <div>
                        <p className="text-xs text-slate-600">Target</p>
                        <p className="font-semibold text-green-600">{metric.target_value || 'N/A'}</p>
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
          {analysis.recovery_plan && Array.isArray(analysis.recovery_plan) && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Recovery Plan Timeline</h3>
              <div className="space-y-4">
                {analysis.recovery_plan.map((phase, idx) => (
                  <div key={`phase-${idx}-${phase.phase || idx}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{phase.phase || `Phase ${idx + 1}`}</h4>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {phase.focus || 'Phase'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-600">ACTIONS</p>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {Array.isArray(phase.actions) && phase.actions.length > 0 ? (
                            phase.actions.map((action, i) => (
                              <li key={`action-${idx}-${i}`} className="text-sm text-slate-700">
                                {action}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-slate-500">No actions specified</li>
                          )}
                        </ul>
                      </div>
                      {phase.expected_impact && (
                        <div className="mt-3 rounded bg-green-50 p-2">
                          <p className="text-xs font-semibold text-green-900">EXPECTED IMPACT</p>
                          <p className="text-sm text-green-900">{phase.expected_impact}</p>
                        </div>
                      )}
                      {Array.isArray(phase.success_metrics) && phase.success_metrics.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-slate-600">SUCCESS METRICS</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {phase.success_metrics.map((metric, i) => (
                              <span key={`metric-${idx}-${i}`} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
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
              <h3 className="mb-4 text-lg font-semibold">Financial Projections & Growth Trajectory</h3>
              <div className="space-y-6">
                {/* Health Score Chart */}
                <div>
                  <p className="mb-3 font-medium text-slate-900">Health Score Progression (0-100)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        {
                          period: 'Month 3',
                          score: analysis.projections_12_months.month_3?.health_score || 0
                        },
                        {
                          period: 'Month 6',
                          score: analysis.projections_12_months.month_6?.health_score || 0
                        },
                        {
                          period: 'Month 12',
                          score: analysis.projections_12_months.month_12?.health_score || 0
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} label={{ value: 'Health Score', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `${value}/100`} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue Growth Chart */}
                <div>
                  <p className="mb-3 font-medium text-slate-900">Revenue Projection</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          period: 'Month 3',
                          revenue: analysis.projections_12_months.month_3?.projected_revenue || 0
                        },
                        {
                          period: 'Month 6',
                          revenue: analysis.projections_12_months.month_6?.projected_revenue || 0
                        },
                        {
                          period: 'Month 12',
                          revenue: analysis.projections_12_months.month_12?.projected_revenue || 0
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Debt Reduction Chart */}
                <div>
                  <p className="mb-3 font-medium text-slate-900">Debt Reduction Strategy</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          period: 'Month 3',
                          debt: analysis.projections_12_months.month_3?.projected_debt || 0
                        },
                        {
                          period: 'Month 6',
                          debt: analysis.projections_12_months.month_6?.projected_debt || 0
                        },
                        {
                          period: 'Month 12',
                          debt: analysis.projections_12_months.month_12?.projected_debt || 0
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis label={{ value: 'Debt ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="debt" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Projections Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-2 text-left font-semibold text-slate-900">Period</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Revenue</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Debt</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900">Health Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(analysis.projections_12_months || {}).map(([period, data]) => (
                        <tr key={`proj-${period}`} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-slate-900">
                            {period === 'month_3' ? 'Month 3' : period === 'month_6' ? 'Month 6' : 'Month 12'}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-700">
                            ${data?.projected_revenue ? data.projected_revenue.toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-700">
                            ${data?.projected_debt ? data.projected_debt.toLocaleString() : 'N/A'}
                          </td>
                          <td className={`px-4 py-2 text-right font-semibold ${getHealthScoreColor(data?.health_score || 0)}`}>
                            {data?.health_score || 'N/A'}
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
          {analysis.recommendations && Array.isArray(analysis.recommendations) && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-semibold">Prioritized Recommendations</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={`rec-${idx}-${rec.recommendation || idx}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{rec.recommendation || 'Recommendation'}</h4>
                        {rec.responsible_team && <p className="mt-1 text-sm text-slate-600">{rec.responsible_team}</p>}
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
                        {rec.priority || 'Medium'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-600">Estimated ROI</p>
                        <p className="font-semibold text-green-600">{rec.estimated_roi || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Cost</p>
                        <p className="text-slate-900">{rec.implementation_cost || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Timeline</p>
                        <p className="text-slate-900">{rec.timeline || 'N/A'}</p>
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
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {analysis.industry_benchmarks ? (
            <>
              {/* Charts Section */}
              <div className="space-y-6">
                {/* Profit Margin Comparison */}
                {(analysis.industry_benchmarks.average_margin || analysis.industry_benchmarks.company_margin) && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="mb-4 text-lg font-semibold">Profit Margin Comparison</h4>
                    <div className="overflow-x-auto">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          {
                            name: 'Industry Avg',
                            value: parseFloat(analysis.industry_benchmarks.average_margin) || 0
                          },
                          {
                            name: 'Your Company',
                            value: parseFloat(analysis.industry_benchmarks.company_margin) || 0
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Debt-to-Revenue Ratio Comparison */}
                {(analysis.industry_benchmarks.debt_to_revenue_ratio_industry || analysis.industry_benchmarks.company_debt_ratio) && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="mb-4 text-lg font-semibold">Debt-to-Revenue Ratio</h4>
                    <div className="overflow-x-auto">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          {
                            name: 'Industry Std',
                            value: parseFloat(analysis.industry_benchmarks.debt_to_revenue_ratio_industry) || 0
                          },
                          {
                            name: 'Your Company',
                            value: parseFloat(analysis.industry_benchmarks.company_debt_ratio) || 0
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Ratio (x)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => `${value}x`} />
                          <Bar dataKey="value" fill={parseFloat(analysis.industry_benchmarks.company_debt_ratio) > parseFloat(analysis.industry_benchmarks.debt_to_revenue_ratio_industry) ? '#ef4444' : '#10b981'} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Benchmarks */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {analysis.industry_benchmarks.industry_growth_rate && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-xs font-semibold text-blue-600">INDUSTRY GROWTH RATE</p>
                    <p className="mt-2 text-2xl font-bold text-blue-900">{analysis.industry_benchmarks.industry_growth_rate}</p>
                    <p className="mt-2 text-xs text-blue-700">Typical annual growth in this industry</p>
                  </div>
                )}
                {analysis.industry_benchmarks.average_margin && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-xs font-semibold text-green-600">HEALTHY PROFIT MARGIN</p>
                    <p className="mt-2 text-2xl font-bold text-green-900">{analysis.industry_benchmarks.average_margin}</p>
                    <p className="mt-2 text-xs text-green-700">Industry standard margin benchmark</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-700">📊 Benchmark data not available yet. Ensure your analysis includes industry comparison data.</p>
            </div>
          )}
        </div>
      )}

      {/* Training Resources Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          {analysis.training_resources && Array.isArray(analysis.training_resources) && analysis.training_resources.length > 0 ? (
            <>
              <p className="text-sm text-slate-600">
                💡 Recommended learning resources to improve your business skills and understand recovery strategies
              </p>
              {analysis.training_resources.map((resource, idx) => (
                <a
                  key={`resource-${idx}-${resource.resource_name || idx}`}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-slate-200 p-4 transition hover:border-green-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{resource.resource_name || 'Resource'}</h4>
                      {resource.topic && <p className="mt-1 text-sm text-slate-600">📚 {resource.topic}</p>}
                      {resource.relevance && <p className="mt-2 text-xs text-slate-500">✓ {resource.relevance}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resource.provider && (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">{resource.provider}</span>
                        )}
                        {resource.duration && (
                          <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">⏱ {resource.duration}</span>
                        )}
                        {resource.cost && (
                          <span
                            className={
                              resource.cost === 'free'
                                ? 'rounded bg-green-100 px-2 py-1 text-xs text-green-800'
                                : 'rounded bg-orange-100 px-2 py-1 text-xs text-orange-800'
                            }
                          >
                            💰 {resource.cost}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-2xl">→</div>
                  </div>
                </a>
              ))}
            </>
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-700">📚 Training resources not yet available. They will appear after the first analysis.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
