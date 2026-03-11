import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";
import { firebaseAuth } from "../firebase";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async (payload) => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(firebaseAuth, payload.email, payload.password);
      await auth.completeFirebaseSession();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      {error && <p className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </section>
  );
}

export default Login;
