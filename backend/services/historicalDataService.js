const pool = require("../data/postgres");

/**
 * Get all previous analyses for a company
 */
async function getPreviousAnalyses(companyName, userId = null) {
  try {
    const query = userId
      ? `SELECT id, company_name, created_at, risk_level, health_score, 
         financial_snapshot, projections_12_months, industry_benchmarks, 
         success_metrics, analysis_data
         FROM analyses 
         WHERE company_name = $1 AND owner_user_id = $2 
         ORDER BY created_at DESC 
         LIMIT 10`
      : `SELECT id, company_name, created_at, risk_level, health_score, 
         financial_snapshot, projections_12_months, industry_benchmarks, 
         success_metrics, analysis_data
         FROM analyses 
         WHERE company_name = $1 
         ORDER BY created_at DESC 
         LIMIT 10`;

    const params = userId ? [companyName, userId] : [companyName];
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[HISTORY SERVICE] Error fetching previous analyses:", error);
    throw error;
  }
}

/**
 * Get the most recent analysis for comparison
 */
async function getPreviousAnalysis(companyName, userId = null) {
  const analyses = await getPreviousAnalyses(companyName, userId);
  return analyses.length > 0 ? analyses[0] : null;
}

/**
 * Compare current analysis with previous one
 */
function compareAnalyses(currentAnalysis, previousAnalysis) {
  if (!previousAnalysis) {
    return {
      isFirstAnalysis: true,
      comparison: null,
    };
  }

  const comparison = {
    isFirstAnalysis: false,
    previousDate: previousAnalysis.created_at,
    currentDate: new Date().toISOString(),
    changes: {
      riskLevel: {
        previous: previousAnalysis.risk_level,
        current: currentAnalysis.risk_level,
        improved: getRiskImprovement(previousAnalysis.risk_level, currentAnalysis.risk_level),
      },
      healthScore: {
        previous: previousAnalysis.health_score,
        current: currentAnalysis.risk_level === "Low" ? 75 : currentAnalysis.risk_level === "Medium" ? 55 : 35,
        change: (currentAnalysis.risk_level === "Low" ? 75 : currentAnalysis.risk_level === "Medium" ? 55 : 35) - previousAnalysis.health_score,
      },
      financialSnapshot: compareFinancialSnapshot(
        previousAnalysis.financial_snapshot,
        currentAnalysis.financial_snapshot
      ),
      mainProblems: compareProblems(
        previousAnalysis.main_problems,
        currentAnalysis.main_problems
      ),
    },
  };

  return comparison;
}

/**
 * Compare financial snapshots
 */
function compareFinancialSnapshot(prev, curr) {
  if (!prev || !curr) return null;

  return {
    previous: prev,
    current: curr,
    changed: JSON.stringify(prev) !== JSON.stringify(curr),
  };
}

/**
 * Compare problem profiles
 */
function compareProblems(prevProblems, currProblems) {
  const prevCount = Array.isArray(prevProblems) ? prevProblems.length : 0;
  const currCount = Array.isArray(currProblems) ? currProblems.length : 0;

  return {
    previousCount: prevCount,
    currentCount: currCount,
    reducedProblems: prevCount > currCount,
    reductionPercentage: prevCount > 0 ? Math.round(((prevCount - currCount) / prevCount) * 100) : 0,
  };
}

/**
 * Helper to determine if risk level improved
 */
function getRiskImprovement(prev, curr) {
  const riskOrder = { High: 3, Medium: 2, Low: 1 };
  return riskOrder[curr] < riskOrder[prev];
}

/**
 * Save complete analysis data to database
 */
async function saveAnalysisData(analysisId, fullAnalysisData) {
  try {
    const query = `
      UPDATE analyses 
      SET analysis_data = $1,
          financial_snapshot = $2,
          projections_12_months = $3,
          industry_benchmarks = $4,
          training_resources = $5,
          success_metrics = $6
      WHERE id = $7
    `;

    await pool.query(query, [
      JSON.stringify(fullAnalysisData),
      JSON.stringify(fullAnalysisData.financial_snapshot || null),
      JSON.stringify(fullAnalysisData.projections_12_months || null),
      JSON.stringify(fullAnalysisData.industry_benchmarks || null),
      JSON.stringify(fullAnalysisData.training_resources || null),
      JSON.stringify(fullAnalysisData.success_metrics || null),
      analysisId,
    ]);

    console.log(`[HISTORY SERVICE] Analysis data saved for ID: ${analysisId}`);
  } catch (error) {
    console.error("[HISTORY SERVICE] Error saving analysis data:", error);
    throw error;
  }
}

module.exports = {
  getPreviousAnalyses,
  getPreviousAnalysis,
  compareAnalyses,
  saveAnalysisData,
};
