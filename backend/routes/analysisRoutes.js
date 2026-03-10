const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const { analyses } = require("../data/db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { analyzeBusinessWithNova } = require("../services/novaService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
        revenueChange,
        debt,
        reviewTrend,
        documentText,
      });

      const savedRecord = {
        id: Date.now().toString(),
        ownerUserId: req.user.id,
        ownerRole: req.user.role,
        companyName,
        industry,
        revenueChange,
        debt,
        reviewTrend,
        createdAt: new Date().toISOString(),
        analysis: {
          risk_level: analysisResult.risk_level,
          main_problems: analysisResult.main_problems,
          recovery_plan: analysisResult.recovery_plan,
          recommendations: analysisResult.recommendations,
        },
      };

      analyses.push(savedRecord);

      return res.json(savedRecord.analysis);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to analyze business with Nova.",
        error: error.message,
      });
    }
  }
);

router.get("/analyses", authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === "personnel") {
    return res.json({ analyses });
  }

  if (role === "company") {
    const ownAnalyses = analyses.filter((item) => item.ownerUserId === id);
    return res.json({ analyses: ownAnalyses });
  }

  const employeeView = analyses.map((item) => ({
    id: item.id,
    companyName: item.companyName,
    industry: item.industry,
    createdAt: item.createdAt,
    analysis: item.analysis,
  }));

  return res.json({ analyses: employeeView });
});

module.exports = router;
