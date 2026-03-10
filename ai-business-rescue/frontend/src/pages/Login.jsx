import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(payload);
      auth.login(data);
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
