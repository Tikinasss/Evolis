const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const { query } = require("../data/postgres");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { analyzeBusinessWithNova } = require("../services/novaService");
const { sendHighRiskNotification } = require("../services/notificationService");
const { getPreviousAnalyses, compareAnalyses } = require("../services/historicalDataService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function normalizeRiskLevel(riskLevel) {
  if (riskLevel === "High" || riskLevel === "Medium" || riskLevel === "Low") {
    return riskLevel;
  }
  return "Medium";
}

function computeHealthScore({ riskLevel, revenueChange, debt }) {
  const normalizedRisk = normalizeRiskLevel(riskLevel);
  const riskPenalty = normalizedRisk === "High" ? 45 : normalizedRisk === "Medium" ? 25 : 10;
  const revenuePenalty = Math.max(0, Number(revenueChange) < 0 ? Math.min(25, Math.abs(Number(revenueChange)) / 2) : 0);
  const debtPenalty = Math.max(0, Math.min(25, Number(debt) / 100000));
  return Math.max(0, Math.round(100 - riskPenalty - revenuePenalty - debtPenalty));
}

function mapAnalysisRow(row) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    ownerRole: row.owner_role,
    companyName: row.company_name,
    industry: row.industry,
    revenueChange: Number(row.revenue_change),
    debt: Number(row.debt),
    reviewTrend: row.review_trend,
    status: row.status,
    healthScore: row.health_score,
    createdAt: row.created_at,
    analysis: {
      risk_level: row.risk_level,
      main_problems: row.main_problems || [],
      recovery_plan: row.recovery_plan || [],
      recommendations: row.recommendations || [],
    },
  };
}

function buildAnalysesFilter(req) {
  const { role, id } = req.user;
  const { risk, industry, q, dateFrom, dateTo, status } = req.query;

  const params = [];
  const where = [];

  // IMPORTANT: Filter by owner_user_id for all non-personnel roles
  // Personnel can see all analyses, but company and employee only see their own
  if (role !== "personnel") {
    params.push(id);
    where.push(`owner_user_id = $${params.length}`);
  }

  if (risk) {
    params.push(risk);
    where.push(`risk_level = $${params.length}`);
  }

  if (industry) {
    params.push(industry);
    where.push(`industry ILIKE $${params.length}`);
  }

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    where.push(`(company_name ILIKE $${params.length} OR industry ILIKE $${params.length})`);
  }

  if (dateFrom) {
    params.push(dateFrom);
    where.push(`created_at >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    where.push(`created_at <= $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

async function getAnalysisById(analysisId) {
  const result = await query("SELECT * FROM analyses WHERE id = $1", [analysisId]);
  return result.rows[0];
}

function canAccessAnalysis(user, analysis) {
  if (!analysis) {
    return false;
  }

  // Personnel can access all analyses (they manage the platform)
  if (user.role === "personnel") {
    return true;
  }

  // Company and employee can only access their own analyses
  return analysis.owner_user_id === user.id;
}

function canManageAnalysis(user, analysis) {
  if (!analysis) {
    return false;
  }

  if (user.role === "personnel") {
    return true;
  }

  if (user.role === "company") {
    return analysis.owner_user_id === user.id;
  }

  return false;
}

function canWriteNote(user, analysis) {
  return canManageAnalysis(user, analysis);
}

router.post(
  "/analyze-business",
  authenticateToken,
  authorizeRoles("employee", "company", "personnel"),
  upload.single("document"),
  async (req, res) => {
    try {
      const input = req.body;
      const { companyName, industry, revenueChange, debt, reviewTrend } = input;

      if (!companyName || !industry || revenueChange === undefined || debt === undefined || !reviewTrend) {
        return res.status(400).json({
          message: "companyName, industry, revenueChange, debt, and reviewTrend are required.",
        });
      }

      // Validate that revenueChange and debt are valid numbers
      const revenueNum = Number(revenueChange);
      const debtNum = Number(debt);

      if (isNaN(revenueNum)) {
        return res.status(400).json({
          message: "Revenue change must be a valid number.",
        });
      }

      if (isNaN(debtNum) || debtNum < 0) {
        return res.status(400).json({
          message: "Debt must be a valid non-negative number.",
        });
      }

      // Validate reviewTrend
      const validTrends = ["improving", "stable", "decreasing", "negative"];
      if (!validTrends.includes(reviewTrend.toLowerCase())) {
        return res.status(400).json({
          message: "Review trend must be one of: improving, stable, decreasing, or negative.",
        });
      }

      let documentText = "";
      if (req.file) {
        try {
          const parsed = await pdfParse(req.file.buffer);
          documentText = (parsed.text || "").trim();
        } catch (_parseError) {
          documentText = "Unable to parse uploaded PDF text. Consider manual review.";
        }
      }

      const analysisResult = await analyzeBusinessWithNova({
        companyName,
        industry,
        revenueChange: revenueNum,
        debt: debtNum,
        reviewTrend,
        documentText,
      });

      const riskLevel = normalizeRiskLevel(analysisResult.risk_level);
      const healthScore = computeHealthScore({
        riskLevel,
        revenueChange: revenueNum,
        debt: debtNum,
      });

      const insert = await query(
        `
        INSERT INTO analyses (
          owner_user_id,
          owner_role,
          company_name,
          industry,
          revenue_change,
          debt,
          review_trend,
          status,
          risk_level,
          health_score,
          main_problems,
          recovery_plan,
          recommendations,
          analysis_data,
          financial_snapshot,
          projections_12_months,
          industry_benchmarks,
          training_resources,
          success_metrics
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb)
        RETURNING *
        `,
        [
          req.user.id,
          req.user.role,
          companyName,
          industry,
          revenueNum,
          debtNum,
          reviewTrend,
          riskLevel,
          healthScore,
          JSON.stringify(Array.isArray(analysisResult.main_problems) ? analysisResult.main_problems : []),
          JSON.stringify(Array.isArray(analysisResult.recovery_plan) ? analysisResult.recovery_plan : []),
          JSON.stringify(Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : []),
          JSON.stringify(analysisResult),
          JSON.stringify(analysisResult.financial_snapshot || null),
          JSON.stringify(analysisResult.projections_12_months || null),
          JSON.stringify(analysisResult.industry_benchmarks || null),
          JSON.stringify(analysisResult.training_resources || null),
          JSON.stringify(analysisResult.success_metrics || null),
        ]
      );

      if (riskLevel === "High") {
        await sendHighRiskNotification({
          companyName,
          riskLevel,
          recipientEmail: process.env.ALERT_EMAIL || req.user.email,
        });
      }

      const saved = mapAnalysisRow(insert.rows[0]);
      return res.json({
        ...saved,
        analysisData: analysisResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to analyze business with Nova.",
        error: error.message,
      });
    }
  }
);

router.get("/analyses", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));

    const { whereSql, params } = buildAnalysesFilter(req);

    const countResult = await query(
      `
      SELECT COUNT(*)::int AS total
      FROM analyses
      ${whereSql}
      `,
      params
    );

    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const normalizedPage = Math.min(page, totalPages);
    const offset = (normalizedPage - 1) * pageSize;

    const listParams = [...params, pageSize, offset];
    const result = await query(
      `
      SELECT *
      FROM analyses
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${listParams.length - 1}
      OFFSET $${listParams.length}
      `,
      listParams
    );

    const analyses = result.rows.map(mapAnalysisRow);
    const payload =
      req.user.role === "employee"
        ? analyses.map((item) => ({
            id: item.id,
            companyName: item.companyName,
            industry: item.industry,
            status: item.status,
            healthScore: item.healthScore,
            createdAt: item.createdAt,
            analysis: item.analysis,
          }))
        : analyses;

    return res.json({
      analyses: payload,
      pagination: {
        page: normalizedPage,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load analyses.", error: error.message });
  }
});

router.get("/analyses/summary/health-trend", authenticateToken, async (req, res) => {
  try {
    const params = [];
    let where = "";

    if (req.user.role === "company") {
      params.push(req.user.id);
      where = "WHERE owner_user_id = $1";
    }

    const result = await query(
      `
      SELECT DATE_TRUNC('day', created_at)::date AS day,
             ROUND(AVG(health_score))::int AS avg_score,
             COUNT(*)::int AS total
      FROM analyses
      ${where}
      GROUP BY day
      ORDER BY day ASC
      LIMIT 30
      `,
      params
    );

    return res.json({ points: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load health trend.", error: error.message });
  }
});

router.patch("/analyses/:analysisId/status", authenticateToken, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { status } = req.body;

    if (!["draft", "in_progress", "completed", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const analysis = await getAnalysisById(analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (!canManageAnalysis(req.user, analysis)) {
      return res.status(403).json({ message: "Only company owner or personnel can change status." });
    }

    const updated = await query("UPDATE analyses SET status = $1 WHERE id = $2 RETURNING *", [status, analysisId]);
    return res.json({ analysis: mapAnalysisRow(updated.rows[0]) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
});

router.get("/analyses/compare", authenticateToken, async (req, res) => {
  try {
    const { firstId, secondId } = req.query;
    if (!firstId || !secondId) {
      return res.status(400).json({ message: "firstId and secondId are required." });
    }

    const result = await query("SELECT * FROM analyses WHERE id = ANY($1::uuid[])", [[firstId, secondId]]);
    if (result.rowCount !== 2) {
      return res.status(404).json({ message: "Analyses not found." });
    }

    const [a, b] = result.rows;
    if (!canAccessAnalysis(req.user, a) || !canAccessAnalysis(req.user, b)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const first = mapAnalysisRow(a);
    const second = mapAnalysisRow(b);

    return res.json({
      first,
      second,
      delta: {
        healthScore: second.healthScore - first.healthScore,
        riskChanged: `${first.analysis.risk_level} -> ${second.analysis.risk_level}`,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to compare analyses.", error: error.message });
  }
});

router.get("/analyses/:analysisId/action-items", authenticateToken, async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.analysisId);
    if (!canAccessAnalysis(req.user, analysis)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const items = await query(
      `
      SELECT id, analysis_id AS "analysisId", title, completed, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM analysis_action_items
      WHERE analysis_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.analysisId]
    );

    return res.json({ items: items.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load action items.", error: error.message });
  }
});

router.post("/analyses/:analysisId/action-items", authenticateToken, async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (!canManageAnalysis(req.user, analysis)) {
      return res.status(403).json({ message: "Only company owner or personnel can manage checklist." });
    }

    const { title } = req.body;
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: "A valid title is required." });
    }

    const created = await query(
      `
      INSERT INTO analysis_action_items (analysis_id, owner_user_id, title)
      VALUES ($1, $2, $3)
      RETURNING id, analysis_id AS "analysisId", title, completed, created_at AS "createdAt", updated_at AS "updatedAt"
      `,
      [req.params.analysisId, req.user.id, title.trim()]
    );

    return res.status(201).json({ item: created.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add action item.", error: error.message });
  }
});

router.patch("/action-items/:itemId", authenticateToken, async (req, res) => {
  try {
    const itemLookup = await query(
      `
      SELECT id, analysis_id AS "analysisId", title, completed, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM analysis_action_items
      WHERE id = $1
      `,
      [req.params.itemId]
    );

    if (itemLookup.rowCount === 0) {
      return res.status(404).json({ message: "Action item not found." });
    }

    const currentItem = itemLookup.rows[0];
    const analysis = await getAnalysisById(currentItem.analysisId);

    if (!canManageAnalysis(req.user, analysis)) {
      return res.status(403).json({ message: "Only company owner or personnel can manage checklist." });
    }

    const { completed } = req.body;
    const updated = await query(
      `
      UPDATE analysis_action_items
      SET completed = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, analysis_id AS "analysisId", title, completed, created_at AS "createdAt", updated_at AS "updatedAt"
      `,
      [Boolean(completed), req.params.itemId]
    );

    return res.json({ item: updated.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update action item.", error: error.message });
  }
});

router.get("/analyses/:analysisId/notes", authenticateToken, async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.analysisId);
    if (!canAccessAnalysis(req.user, analysis)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const notes = await query(
      `
      SELECT id, analysis_id AS "analysisId", author_user_id AS "authorUserId", author_name AS "authorName", content, created_at AS "createdAt"
      FROM analysis_notes
      WHERE analysis_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.analysisId]
    );

    return res.json({ notes: notes.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load notes.", error: error.message });
  }
});

router.post("/analyses/:analysisId/notes", authenticateToken, async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (!canWriteNote(req.user, analysis)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { content } = req.body;
    if (!content || content.trim().length < 3) {
      return res.status(400).json({ message: "A valid note is required." });
    }

    const created = await query(
      `
      INSERT INTO analysis_notes (analysis_id, author_user_id, author_name, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, analysis_id AS "analysisId", author_user_id AS "authorUserId", author_name AS "authorName", content, created_at AS "createdAt"
      `,
      [req.params.analysisId, req.user.id, req.user.name, content.trim()]
    );

    return res.status(201).json({ note: created.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create note.", error: error.message });
  }
});

/**
 * Get previous analyses for a company (historical data)
 */
router.get("/company-history/:companyName", authenticateToken, async (req, res) => {
  try {
    const { companyName } = req.params;
    const previousAnalyses = await getPreviousAnalyses(companyName, req.user.id);

    return res.status(200).json({
      companyName,
      analysisCount: previousAnalyses.length,
      analyses: previousAnalyses.map((analysis) => ({
        id: analysis.id,
        createdAt: analysis.created_at,
        riskLevel: analysis.risk_level,
        healthScore: analysis.health_score,
        financialSnapshot: analysis.financial_snapshot,
        mainProblems: analysis.main_problems,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company history.", error: error.message });
  }
});

/**
 * Compare current analysis with previous analysis
 */
router.post("/analyze-business/with-comparison", authenticateToken, authorizeRoles("employee", "company", "personnel"), upload.single("document"), async (req, res) => {
  try {
    const input = req.body;
    const { companyName, industry, revenueChange, debt, reviewTrend } = input;

    if (!companyName || !industry || revenueChange === undefined || debt === undefined || !reviewTrend) {
      return res.status(400).json({
        message: "companyName, industry, revenueChange, debt, and reviewTrend are required.",
      });
    }

    let documentText = "";
    if (req.file) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        documentText = (parsed.text || "").trim();
      } catch (_parseError) {
        documentText = "Unable to parse uploaded PDF text.";
      }
    }

    // Get the current analysis
    const analysisResult = await analyzeBusinessWithNova({
      companyName,
      industry,
      revenueChange,
      debt,
      reviewTrend,
      documentText,
    });

    const riskLevel = normalizeRiskLevel(analysisResult.risk_level);
    const healthScore = computeHealthScore({
      riskLevel,
      revenueChange: Number(revenueChange),
      debt: Number(debt),
    });

    // Get previous analysis for comparison
    const previousAnalyses = await getPreviousAnalyses(companyName, req.user.id);
    const previousAnalysis = previousAnalyses.length > 0 ? previousAnalyses[0] : null;
    const comparison = compareAnalyses(analysisResult, previousAnalysis);

    // Save the new analysis
    const insert = await query(
      `
      INSERT INTO analyses (
        owner_user_id,
        owner_role,
        company_name,
        industry,
        revenue_change,
        debt,
        review_trend,
        status,
        risk_level,
        health_score,
        main_problems,
        recovery_plan,
        recommendations,
        analysis_data,
        financial_snapshot,
        projections_12_months,
        industry_benchmarks,
        training_resources,
        success_metrics
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb)
      RETURNING *
      `,
      [
        req.user.id,
        req.user.role,
        companyName,
        industry,
        revenueChange,
        debt,
        reviewTrend,
        riskLevel,
        healthScore,
        JSON.stringify(analysisResult.main_problems || []),
        JSON.stringify(analysisResult.recovery_plan || []),
        JSON.stringify(analysisResult.recommendations || []),
        JSON.stringify(analysisResult),
        JSON.stringify(analysisResult.financial_snapshot || null),
        JSON.stringify(analysisResult.projections_12_months || null),
        JSON.stringify(analysisResult.industry_benchmarks || null),
        JSON.stringify(analysisResult.training_resources || null),
        JSON.stringify(analysisResult.success_metrics || null),
      ]
    );

    if (!insert.rows.length) {
      return res.status(500).json({ message: "Failed to save analysis." });
    }

    const analysisId = insert.rows[0].id;

    if (riskLevel === "High") {
      await sendHighRiskNotification({
        companyName,
        riskLevel,
        mainProblems: analysisResult.main_problems,
        userId: req.user.id,
        userName: req.user.name,
      });
    }

    return res.status(201).json({
      message: "Analysis completed with historical comparison.",
      analysis: mapAnalysisRow(insert.rows[0]),
      analysisData: analysisResult,
      comparison,
    });
  } catch (error) {
    console.error("[ANALYSIS ROUTE] Error:", error);
    return res.status(500).json({ message: "Analysis failed.", error: error.message });
  }
});

module.exports = router;
