const express = require("express");
const { sendSupportMessage } = require("../services/notificationService");

const router = express.Router();

const ALLOWED_CATEGORIES = new Set([
  "account-access",
  "billing",
  "analysis-quality",
  "bug-report",
  "feature-request",
  "security",
  "other",
]);

router.post("/support/messages", async (req, res) => {
  const { name, email, subject, category, message } = req.body || {};

  if (!name || !email || !subject || !category || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return res.status(400).json({ message: "Invalid support category." });
  }

  try {
    const sent = await sendSupportMessage({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      category,
      message: String(message).trim(),
    });

    if (!sent) {
      return res.status(503).json({ message: "Support service is not configured yet." });
    }

    return res.status(201).json({ message: "Support message sent successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send support message right now." });
  }
});

module.exports = router;