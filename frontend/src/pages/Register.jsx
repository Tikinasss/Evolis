import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import RegisterForm from "../components/RegisterForm";
import { registerFirebaseProfile } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { firebaseAuth, googleProvider } from "../firebase";

function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleRole, setGoogleRole] = useState("employee");
  const navigate = useNavigate();
  const auth = useAuth();

  const handleRegister = async (payload) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password);
      await updateProfile(credential.user, { displayName: payload.name });
      const idToken = await credential.user.getIdToken();

      await registerFirebaseProfile(
        {
          name: payload.name,
          role: payload.role,
        },
        idToken
      );

      await auth.completeFirebaseSession();
      setSuccess("Registration successful.");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await credential.user.getIdToken();

      // Do not block successful Google auth on transient backend sync errors.
      try {
        await registerFirebaseProfile(
          { name: credential.user.displayName || credential.user.email, role: googleRole },
          idToken
        );
      } catch (_syncError) {
        // Intentionally ignored. Session completion still proceeds via Firebase auth state.
      }

      await auth.completeFirebaseSession();
      navigate("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      {error && <p className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-rescue-dark">{success}</p>}
      <RegisterForm onSubmit={handleRegister} loading={loading} />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-4 card-surface p-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Sign up with Google — choose your role first:</p>
        <select
          value={googleRole}
          onChange={(e) => setGoogleRole(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="employee">Employee</option>
          <option value="company">Company</option>
          <option value="personnel">Personnel</option>
        </select>
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </section>
  );
}

export default Register;
