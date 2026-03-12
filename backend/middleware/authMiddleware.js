const jwt = require("jsonwebtoken");

const { query } = require("../data/postgres");
const { getFirebaseAdmin } = require("../services/firebaseAdmin");

async function resolveUserFromDatabase({ firebaseUid, email }) {
  if (!firebaseUid && !email) {
    return null;
  }

  const lookup = await query(
    `
    SELECT id, name, email, role, firebase_uid AS "firebaseUid"
    FROM users
    WHERE ($1::text IS NOT NULL AND firebase_uid = $1)
       OR ($2::text IS NOT NULL AND email = $2)
    ORDER BY CASE WHEN firebase_uid = $1 THEN 0 ELSE 1 END
    LIMIT 1
    `,
    [firebaseUid || null, email || null]
  );

  return lookup.rowCount > 0 ? lookup.rows[0] : null;
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is missing." });
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    if (firebaseAdmin) {
      let decodedFirebase;
      try {
        decodedFirebase = await firebaseAdmin.auth().verifyIdToken(token);
      } catch (firebaseError) {
        console.error("[auth] Firebase token verification failed", {
          code: firebaseError.code,
          message: firebaseError.message,
          path: req.path,
          method: req.method,
        });
        // Token is not a valid Firebase token — fall through to legacy JWT.
        console.warn("[auth] Falling back to legacy JWT verification after Firebase verification failure", {
          path: req.path,
          method: req.method,
        });
        decodedFirebase = null;
      }

      if (decodedFirebase) {
        const dbUser = await resolveUserFromDatabase({
          firebaseUid: decodedFirebase.uid,
          email: decodedFirebase.email ? decodedFirebase.email.toLowerCase() : null,
        });

        if (!dbUser) {
          return res.status(403).json({ message: "User profile is not registered for this Firebase account." });
        }

        req.user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          firebaseUid: dbUser.firebaseUid,
        };
        req.authProvider = "firebase";
        return next();
      }
    } else {
      console.warn("[auth] Firebase Admin unavailable, using legacy JWT verification", {
        path: req.path,
        method: req.method,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    req.authProvider = "jwt";
    return next();
  } catch (error) {
    const isDatabaseError = Boolean(error && (error.code || "").startsWith("42")) ||
      /relation\s+"?.+"?\s+does\s+not\s+exist/i.test(error.message || "") ||
      /getaddrinfo\s+ENOTFOUND/i.test(error.message || "");

    console.error("[auth] Request authentication failed", {
      message: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
    });

    if (isDatabaseError) {
      return res.status(500).json({ message: "Database is unavailable or not initialized." });
    }

    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role permissions." });
    }
    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
