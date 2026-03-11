const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../data/postgres");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
const VALID_ROLES = ["employee", "company", "personnel"];

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
      `,
      [name, normalizedEmail, passwordHash, role]
    );

    const user = created.rows[0];

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();
    const lookup = await query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (lookup.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = lookup.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log in.", error: error.message });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
