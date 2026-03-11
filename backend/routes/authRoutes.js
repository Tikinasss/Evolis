const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../data/postgres");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
const VALID_ROLES = ["employee", "company", "personnel"];

router.post("/auth/firebase/register", authenticateToken, async (req, res) => {
  try {
    if (req.authProvider !== "firebase") {
      return res.status(400).json({ message: "Firebase token is required." });
    }

    const { name, role } = req.body;
    const normalizedEmail = (req.user.email || "").toLowerCase();

    if (!name || !normalizedEmail || !role) {
      return res.status(400).json({ message: "Name, email, and role are required." });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existing = await query(
      `
      SELECT id, name, email, role, firebase_uid AS "firebaseUid"
      FROM users
      WHERE firebase_uid = $1 OR email = $2
      LIMIT 1
      `,
      [req.user.firebaseUid, normalizedEmail]
    );

    if (existing.rowCount > 0) {
      const current = existing.rows[0];
      const updated = await query(
        `
        UPDATE users
        SET name = $1,
            firebase_uid = COALESCE(firebase_uid, $2)
        WHERE id = $3
        RETURNING id, name, email, role, firebase_uid AS "firebaseUid"
        `,
        [name, req.user.firebaseUid, current.id]
      );

      return res.json({ user: updated.rows[0] });
    }

    const created = await query(
      `
      INSERT INTO users (name, email, password_hash, role, firebase_uid)
      VALUES ($1, $2, 'firebase_managed', $3, $4)
      RETURNING id, name, email, role, firebase_uid AS "firebaseUid"
      `,
      [name, normalizedEmail, role, req.user.firebaseUid]
    );

    return res.status(201).json({ user: created.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register Firebase profile.", error: error.message });
  }
});

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

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const profile = await query(
      `
      SELECT id, name, email, role, firebase_uid AS "firebaseUid"
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    if (profile.rowCount === 0) {
      return res.status(404).json({ message: "User profile not found." });
    }

    return res.json({ user: profile.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user profile.", error: error.message });
  }
});

module.exports = router;
