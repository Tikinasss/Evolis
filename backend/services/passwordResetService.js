const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { query } = require("../data/postgres");

// Configure your email service here
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FAILED_LOGIN_THRESHOLD = 3; // Lock account after 3 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_EXPIRY_MS = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Record a failed login attempt
 */
async function recordFailedLogin(email) {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();

  const user = await query("SELECT id, failed_login_attempts FROM users WHERE email = $1", [normalizedEmail]);
  
  if (user.rowCount === 0) {
    return null;
  }

  const userId = user.rows[0].id;
  const attempts = user.rows[0].failed_login_attempts + 1;

  let accountLockedUntil = null;
  if (attempts >= FAILED_LOGIN_THRESHOLD) {
    accountLockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
  }

  await query(
    `
    UPDATE users
    SET failed_login_attempts = $1,
        failed_login_last_attempt_at = $2,
        account_locked_until = $3
    WHERE id = $4
    `,
    [attempts, now, accountLockedUntil, userId]
  );

  return {
    attempts,
    locked: attempts >= FAILED_LOGIN_THRESHOLD,
    lockedUntil: accountLockedUntil,
  };
}

/**
 * Check if account is locked
 */
async function isAccountLocked(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await query(
    "SELECT account_locked_until FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (user.rowCount === 0) {
    return { locked: false };
  }

  const lockedUntil = user.rows[0].account_locked_until;
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    return {
      locked: true,
      lockedUntil: new Date(lockedUntil),
    };
  }

  return { locked: false };
}

/**
 * Reset failed login attempts
 */
async function resetFailedLoginAttempts(email) {
  const normalizedEmail = email.toLowerCase();
  await query(
    `
    UPDATE users
    SET failed_login_attempts = 0,
        account_locked_until = NULL,
        failed_login_last_attempt_at = NULL
    WHERE email = $1
    `,
    [normalizedEmail]
  );
}

/**
 * Generate password reset token and send email
 */
async function generatePasswordResetToken(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await query("SELECT id, name FROM users WHERE email = $1", [normalizedEmail]);

  if (user.rowCount === 0) {
    // For security, don't reveal if email exists
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await query(
    `
    UPDATE users
    SET password_reset_token = $1,
        password_reset_token_expires_at = $2
    WHERE id = $3
    `,
    [resetToken, expiresAt, user.rows[0].id]
  );

  // Try to send email (don't block if it fails)
  try {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Password Reset Request - Evolis",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.rows[0].name},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="${resetLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }

  return {
    success: true,
    message: "If an account exists with this email, a password reset link has been sent.",
  };
}

/**
 * Validate and use password reset token
 */
async function validateAndResetPassword(token, newPassword) {
  const user = await query(
    `
    SELECT id, password_reset_token_expires_at
    FROM users
    WHERE password_reset_token = $1
    `,
    [token]
  );

  if (user.rowCount === 0) {
    return {
      success: false,
      message: "Invalid or expired reset token.",
    };
  }

  const expiresAt = new Date(user.rows[0].password_reset_token_expires_at);
  if (expiresAt < new Date()) {
    return {
      success: false,
      message: "Reset token has expired.",
    };
  }

  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await query(
    `
    UPDATE users
    SET password_hash = $1,
        password_reset_token = NULL,
        password_reset_token_expires_at = NULL,
        failed_login_attempts = 0,
        account_locked_until = NULL
    WHERE id = $2
    `,
    [passwordHash, user.rows[0].id]
  );

  return {
    success: true,
    message: "Password reset successfully. You can now login with your new password.",
  };
}

module.exports = {
  recordFailedLogin,
  isAccountLocked,
  resetFailedLoginAttempts,
  generatePasswordResetToken,
  validateAndResetPassword,
  FAILED_LOGIN_THRESHOLD,
  LOCKOUT_DURATION_MS,
  RESET_TOKEN_EXPIRY_MS,
};
