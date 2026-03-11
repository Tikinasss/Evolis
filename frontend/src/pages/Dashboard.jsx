import { useEffect, useState } from "react";
import BusinessForm from "../components/BusinessForm";
import ResultCard from "../components/ResultCard";
import TutorialGuide from "../components/TutorialGuide";
import UserDashboard from "../components/UserDashboard";
import { analyzeBusiness, getAnalyses } from "../api/client";
import { useAuth } from "../context/AuthContext";

const TUTORIAL_STEPS = [
  {
    target: "header",
    title: "Welcome to your dashboard",
    description:
      "This page lets you submit business data, get an AI diagnosis, and review analysis history in one place.",
  },
  {
    target: "form",
    title: "Step 1: Fill business inputs",
    description:
      "Enter company details, financial signals, and optionally upload a PDF to provide richer context.",
  },
  {
    target: "result",
    title: "Step 2: Review the AI diagnosis",
    description:
      "After submitting, this panel shows risk level, main problems, recovery plan, and recommendations.",
  },
  {
    target: "history",
    title: "Step 3: Track previous analyses",
    description:
      "Use this section to review past analyses according to your role permissions.",
  },
];

function Dashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialKey = user?.id ? `abr_tutorial_seen_${user.id}` : null;

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

  useEffect(() => {
    if (!tutorialKey) {
      return;
    }

    const seenTutorial = localStorage.getItem(tutorialKey) === "true";
    if (!seenTutorial) {
      setIsTutorialOpen(true);
      setTutorialStep(0);
    }
  }, [tutorialKey]);

  useEffect(() => {
    if (!isTutorialOpen) {
      return;
    }

    const target = TUTORIAL_STEPS[tutorialStep]?.target;
    if (!target) {
      return;
    }

    const element = document.getElementById(`tutorial-${target}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isTutorialOpen, tutorialStep]);

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

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    setTutorialStep(0);
  };

  const handleSkipTutorial = () => {
    if (tutorialKey) {
      localStorage.setItem(tutorialKey, "true");
    }
    closeTutorial();
  };

  const handleFinishTutorial = () => {
    if (tutorialKey) {
      localStorage.setItem(tutorialKey, "true");
    }
    closeTutorial();
  };

  const startTutorial = () => {
    setTutorialStep(0);
    setIsTutorialOpen(true);
  };

  const highlightClass = (target) =>
    isTutorialOpen && TUTORIAL_STEPS[tutorialStep]?.target === target
      ? "ring-2 ring-rescue-primary ring-offset-2 ring-offset-rescue-gray"
      : "";

  return (
    <section className="space-y-6">
      <header id="tutorial-header" className={`card-surface p-6 ${highlightClass("header")}`}>
        <p className="text-sm text-slate-600">Signed in as</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-rescue-dark">
            {user?.name} ({user?.role})
          </h1>
          <button
            type="button"
            onClick={startTutorial}
            className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-rescue-dark hover:bg-green-50"
          >
            Start tutorial
          </button>
        </div>
      </header>

      {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div id="tutorial-form" className={highlightClass("form")}>
          <BusinessForm onSubmit={handleSubmit} loading={loading} />
        </div>
        <div id="tutorial-result" className={highlightClass("result")}>
          <ResultCard result={result} />
        </div>
      </div>

      <div id="tutorial-history" className={highlightClass("history")}>
        <UserDashboard role={user?.role} analyses={analyses} />
      </div>

      <TutorialGuide
        isOpen={isTutorialOpen}
        steps={TUTORIAL_STEPS}
        currentStep={tutorialStep}
        onPrev={() => setTutorialStep((prev) => Math.max(0, prev - 1))}
        onNext={() => setTutorialStep((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
        onSkip={handleSkipTutorial}
        onFinish={handleFinishTutorial}
      />
    </section>
  );
}

export default Dashboard;
