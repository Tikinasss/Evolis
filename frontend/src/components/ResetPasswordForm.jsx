import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/client';

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMessage('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Both password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, newPassword);

      setSuccessMessage(response.message || 'Password reset successfully!');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rescue-gray px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(22,101,52,0.14),transparent_30%)]" />
      
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-green-100 bg-white/90 px-6 py-8 shadow-panel backdrop-blur">
        <h1 className="mb-2 text-2xl font-bold text-rescue-dark">Reset Your Password</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Enter your new password below. Make sure it's strong and secure.
        </p>

        {successMessage && (
          <div className="mb-4 w-full rounded-lg bg-green-100 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 w-full rounded-lg bg-red-100 p-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        {!token ? (
          <div className="text-center">
            <p className="text-sm text-slate-600">
              <button
                onClick={() => navigate('/forgot-password')}
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Request a new reset link
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-rescue-dark">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-rescue-dark">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
