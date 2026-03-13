import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/client';

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await forgotPassword(email);
      
      setSuccessMessage(
        'Password reset instructions have been sent to your email. Please check your inbox.'
      );
      setEmail('');
      
      // Optional: Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rescue-gray px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(22,101,52,0.14),transparent_30%)]" />
      
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-green-100 bg-white/90 px-6 py-8 shadow-panel backdrop-blur">
        <h1 className="mb-2 text-2xl font-bold text-rescue-dark">Forgot Password?</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
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

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-rescue-dark">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center text-sm">
            <p className="text-slate-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Back to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
