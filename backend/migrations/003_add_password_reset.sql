-- Add password reset and failed login tracking columns to users table

ALTER TABLE users
ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
ADD COLUMN failed_login_last_attempt_at TIMESTAMPTZ,
ADD COLUMN account_locked_until TIMESTAMPTZ,
ADD COLUMN password_reset_token TEXT,
ADD COLUMN password_reset_token_expires_at TIMESTAMPTZ;

-- Create index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_email_for_reset ON users(email);
