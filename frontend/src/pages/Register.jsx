import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { registerUser } from "../api/client";

function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (payload) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser(payload);
      setSuccess("Registration successful. You can now login.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      {error && <p className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-rescue-dark">{success}</p>}
      <RegisterForm onSubmit={handleRegister} loading={loading} />
    </section>
  );
}

export default Register;
