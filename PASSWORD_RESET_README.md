# Password Reset & Account Lockout Implementation

## Overview

This feature implements a robust password reset mechanism with account lockout protection after 3 failed login attempts.

## Backend Changes

### 1. Database Migration (003_add_password_reset.sql)
Added columns to the `users` table:
- `failed_login_attempts` - Tracks number of consecutive failed login attempts
- `failed_login_last_attempt_at` - Timestamp of last failed attempt
- `account_locked_until` - When the account lock expires (15 minutes after 3rd failed attempt)
- `password_reset_token` - One-time token for password reset (expires after 1 hour)
- `password_reset_token_expires_at` - Token expiration timestamp

### 2. Password Reset Service (services/passwordResetService.js)
Core business logic:
- `recordFailedLogin(email)` - Records failed attempts and locks account after 3 attempts
- `isAccountLocked(email)` - Checks if account is currently locked
- `resetFailedLoginAttempts(email)` - Clears failed attempts (called after successful login)
- `generatePasswordResetToken(email)` - Generates token and sends reset email
- `validateAndResetPassword(token, newPassword)` - Validates token and updates password

**Configuration:**
- Failed login threshold: 3 attempts
- Lockout duration: 15 minutes
- Reset token expiry: 1 hour

### 3. Updated Auth Routes (routes/authRoutes.js)
New endpoints:
- `POST /api/forgot-password` - Send password reset email
- `POST /api/reset-password` - Validate token and reset password

Updated endpoints:
- `POST /api/login` - Now checks account lock status and tracks failed attempts

**Login Response (on failure):**
```json
{
  "message": "Invalid credentials. 1 of 3 attempts. Account will lock after 3 failed attempts.",
  "failedAttempts": 1,
  "threshold": 3
}
```

**Login Response (account locked):**
```json
{
  "message": "Account is locked due to too many failed login attempts. Please try again later or use the forgot password feature.",
  "lockedUntil": "2026-03-13T15:30:00Z"
}
```

## Frontend Changes

### 1. ForgotPasswordForm Component
User-friendly form to request password reset:
- Email input field
- Loading state during request
- Success/error messages
- Redirects to login after successful submission

### 2. ResetPasswordForm Component
Form to reset password with validation:
- New password input with confirmation
- Validates passwords match and meet minimum length
- Uses URL token from email link
- Clears failed login attempts after successful reset

### 3. Updated LoginForm Component
Added "Forgot your password?" link below password field

### 4. New Routes in App.jsx
- `/forgot-password` - Password reset request page
- `/reset-password?token=xxx` - Password reset confirmation page

## Email Configuration

To enable email notifications, configure these environment variables in `.env`:

```env
# Email Configuration (for password reset notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup (SMTP)
1. Enable 2-factor authentication on your Gmail account
2. Create an "App Password" at https://myaccount.google.com/apppasswords/
3. Use the 16-character app password as `EMAIL_PASSWORD`

### Alternative Email Services
The `nodemailer` library supports:
- Outlook/Microsoft 365
- Yahoo Mail
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP servers

Update the `EMAIL_SERVICE` and authentication method accordingly.

## Security Features

✅ **Account Lockout** - Prevents brute force attacks with 15-minute lockout after 3 failed attempts
✅ **Token Expiration** - Reset tokens expire after 1 hour
✅ **Secure Token Generation** - Uses cryptographically secure random tokens
✅ **Password Reset Clears Lockout** - Locked accounts can regain access via password reset
✅ **Email Obfuscation** - Forgot password endpoint doesn't reveal if email exists (for security)
✅ **HTTPS Required** - Password reset links should be sent over HTTPS in production

## User Workflow

### 1. Forgot Password Flow
1. User clicks "Forgot your password?" on login page
2. User enters email address
3. System sends reset link to email
4. User clicks link in email
5. User enters new password on reset page
6. User can login with new password

### 2. Account Lockout
1. User enters wrong password 1st time → "1 of 3 attempts" message
2. User enters wrong password 2nd time → "2 of 3 attempts" message
3. User enters wrong password 3rd time → Account locked for 15 minutes
4. User must wait 15 minutes OR use "Forgot your password?" to reset

## Testing

### Test Failed Login Attempts:
```bash
# 1st failed attempt
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Response: "1 of 3 attempts"
```

### Test Password Reset:
```bash
# Request reset
curl -X POST http://localhost:5000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get token from database for testing
psql -c "SELECT password_reset_token FROM users WHERE email='test@example.com'"

# Reset password (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN","newPassword":"newpassword123"}'
```

## Migration Instructions

To apply these changes to an existing database:

```bash
cd backend
npm run db:migrate
```

This runs all migration files in `backend/migrations/` in numerical order.

## Frontend Dependencies

Already included in the project:
- `react-router-dom` - For navigation and URL parameters
- Tailwind CSS - For styling

No additional npm packages needed!
