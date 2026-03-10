import { useEffect, useState } from "react";
import BusinessForm from "../components/BusinessForm";
import ResultCard from "../components/ResultCard";
import UserDashboard from "../components/UserDashboard";
import { analyzeBusiness, getAnalyses } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const data = await getAnalyses(token);
        setAnalyses(data.analyses || []);
      } catch (_error) {
        setAnalyses([]);
      }
    }

    fetchAnalyses();
  }, [token]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const data = await analyzeBusiness(payload, token);
      setResult(data);

      const refreshed = await getAnalyses(token);
      setAnalyses(refreshed.analyses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="card-surface p-6">
        <p className="text-sm text-slate-600">Signed in as</p>
        <h1 className="text-2xl font-bold text-rescue-dark">
          {user?.name} ({user?.role})
        </h1>
      </header>

      {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <BusinessForm onSubmit={handleSubmit} loading={loading} />
        <ResultCard result={result} />
      </div>

      <UserDashboard role={user?.role} analyses={analyses} />
    </section>
  );
}

export default Dashboard;
