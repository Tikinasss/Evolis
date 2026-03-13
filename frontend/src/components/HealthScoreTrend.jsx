import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function HealthScoreTrend({ trendData = [] }) {
  const hasData = trendData.length > 0;
  
  if (!hasData) {
    return (
      <div className="card-surface p-6">
        <div className="mb-4">
          <h3 className="section-title">📈 Score de Santé - Progression</h3>
          <p className="mt-1 text-xs text-slate-500">
            Suivez l'évolution de la santé financière de votre entreprise au fil du temps
          </p>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm font-semibold text-slate-700">Aucune donnée à afficher</p>
            <p className="text-xs text-slate-500 mt-2">
              Soumettez une analyse commerciale pour commencer à suivre la progression
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latestScore = trendData[trendData.length - 1].avg_score;
  const highestScore = Math.max(...trendData.map((p) => p.avg_score));
  const lowestScore = Math.min(...trendData.map((p) => p.avg_score));
  const avgScore = (trendData.reduce((sum, p) => sum + p.avg_score, 0) / trendData.length).toFixed(1);
  const totalAnalyses = trendData.reduce((sum, p) => sum + p.total, 0);

  // Determine trend
  const previousScore = trendData[trendData.length - 2]?.avg_score || latestScore;
  const isImproving = latestScore > previousScore;
  const scoreDelta = latestScore - previousScore;

  // Determine health status based on score
  const getHealthStatus = (score) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-700", emoji: "🟢" };
    if (score >= 60) return { label: "Bon", color: "bg-blue-100 text-blue-700", emoji: "🔵" };
    if (score >= 40) return { label: "Moyen", color: "bg-yellow-100 text-yellow-700", emoji: "🟡" };
    return { label: "Critique", color: "bg-red-100 text-red-700", emoji: "🔴" };
  };

  const healthStatus = getHealthStatus(latestScore);

  return (
    <div className="card-surface p-6 space-y-6">
      {/* Header with explanation */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">📈 Score de Santé - Progression</h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>À quoi ça sert?</strong> Ce graphique montre comment la santé financière de votre entreprise évolue au fil du temps. 
              Un score élevé (80+) indique une entreprise saine; un score bas (&lt;40) suggère des problèmes urgents à résoudre.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {trendData.length} analyse(s) suivie(s)
          </span>
        </div>
      </div>

      {/* Current Status Card */}
      <div className={`rounded-lg ${healthStatus.color} p-4 border-l-4 border-current`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-75">État actuel</p>
            <p className="text-2xl font-bold mt-1">{latestScore}/100</p>
            <p className="text-xs font-semibold mt-1 opacity-75">{healthStatus.label}</p>
          </div>
          <div className="text-4xl">{healthStatus.emoji}</div>
        </div>
        {scoreDelta !== 0 && (
          <p className="mt-2 text-xs">
            {isImproving ? "📈 Amélioration de" : "📉 Détérioration de"} {Math.abs(scoreDelta).toFixed(1)} points
            {previousScore !== latestScore ? " par rapport à la dernière analyse" : ""}
          </p>
        )}
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-semibold text-blue-600">Score Actuel</p>
          <p className="mt-2 text-xl font-bold text-blue-900">{latestScore}</p>
          <p className="text-xs text-blue-600 mt-1">Dernière analyse</p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-semibold text-green-600">Meilleur Score</p>
          <p className="mt-2 text-xl font-bold text-green-900">{highestScore}</p>
          <p className="text-xs text-green-600 mt-1">Maximum historique</p>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-semibold text-orange-600">Score Moyen</p>
          <p className="mt-2 text-xl font-bold text-orange-900">{avgScore}</p>
          <p className="text-xs text-orange-600 mt-1">Moyenne historique</p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <p className="text-xs font-semibold text-purple-600">Analyses</p>
          <p className="mt-2 text-xl font-bold text-purple-900">{totalAnalyses}</p>
          <p className="text-xs text-purple-600 mt-1">Total suivies</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">📊 Évolution du Score</p>
          <p className="text-xs text-slate-500 mt-1">
            Cliquez sur le graphique pour voir les détails. Les points rouges indiquent le seuil critique (40/100).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={trendData.map((point) => ({
                date: new Date(point.day).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                }),
                score: point.avg_score,
                analyses: point.total,
              }))}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              {/* Reference line for critical level */}
              <ReferenceLine
                y={40}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: "Seuil critique (40)",
                  position: "right",
                  fill: "#ef4444",
                  fontSize: 11,
                }}
              />

              {/* Reference line for healthy level */}
              <ReferenceLine
                y={80}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{
                  value: "Excellent (80)",
                  position: "right",
                  fill: "#10b981",
                  fontSize: 11,
                }}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
                angle={-45}
                textAnchor="end"
                height={80}
              />

              <YAxis
                domain={[0, 100]}
                label={{
                  value: "Score de Santé (0-100)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value, name) => {
                  if (name === "score") return [value, "Score"];
                  if (name === "analyses") return [value, "Analyses"];
                  return value;
                }}
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
          📖 Comment interpréter le score?
        </p>
        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="text-lg">🟢</span>
            <div>
              <strong>80-100: Excellent</strong> - L'entreprise est saine financièrement. Continuez les bonnes pratiques.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🔵</span>
            <div>
              <strong>60-79: Bon</strong> - L'entreprise va bien, mais il y a des domaines d'amélioration.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🟡</span>
            <div>
              <strong>40-59: Moyen</strong> - Des problèmes existent et nécessitent attention. Suivez le plan de récupération.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🔴</span>
            <div>
              <strong>&lt;40: Critique</strong> - Intervention urgente requise. Appliquez immédiatement les recommandations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthScoreTrend;
