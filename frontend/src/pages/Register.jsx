import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import RegisterForm from "../components/RegisterForm";
import { registerFirebaseProfile } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { firebaseAuth } from "../firebase";

function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  return (
    <section className="mx-auto max-w-md">
      {error && <p className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-rescue-dark">{success}</p>}
      <RegisterForm onSubmit={handleRegister} loading={loading} />
    </section>
  );
}

export default Register;
