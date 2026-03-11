import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home-hero relative overflow-hidden rounded-3xl px-4 py-10 sm:px-8 md:px-10">
      <div className="home-blob home-blob-left" />
      <div className="home-blob home-blob-right" />

      <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
        <div className="home-enter-up">
          <p className="mb-3 inline-flex rounded-full border border-green-200 bg-white/80 px-3 py-1 text-sm font-semibold text-rescue-dark backdrop-blur">
            AWS + Amazon Nova
          </p>
          <h1 className="text-4xl font-black leading-tight text-rescue-dark sm:text-5xl">
            Rescue Struggling Businesses With AI Insight
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-700">
            AI Business Rescue helps teams detect financial risk, identify root causes, and generate practical
            turnaround plans in minutes using Amazon Nova.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-rescue-primary px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rescue-dark"
            >
              Start Now
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-rescue-dark bg-white/70 px-5 py-3 font-semibold text-rescue-dark transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Login
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
            <div className="home-stat-card">
              <p className="text-xl font-black text-rescue-dark">3x</p>
              <p className="text-xs text-slate-600">faster triage</p>
            </div>
            <div className="home-stat-card">
              <p className="text-xl font-black text-rescue-dark">30s</p>
              <p className="text-xs text-slate-600">risk snapshot</p>
            </div>
            <div className="home-stat-card">
              <p className="text-xl font-black text-rescue-dark">Role</p>
              <p className="text-xs text-slate-600">aware workflow</p>
            </div>
          </div>
        </div>

        <div className="home-enter-up home-enter-delay space-y-4">
          <div className="card-surface p-6">
            <h2 className="section-title">What You Get</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="home-feature-item">Role-based dashboards for employee, company, and personnel users</li>
              <li className="home-feature-item">Business risk level classification: Low, Medium, High</li>
              <li className="home-feature-item">Main problem detection from performance signals</li>
              <li className="home-feature-item">Actionable AI recovery plans and recommendations</li>
              <li className="home-feature-item">Optional PDF upload for richer context</li>
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="home-mini-card">
              <p className="text-sm font-semibold text-rescue-dark">Risk radar</p>
              <p className="mt-1 text-xs text-slate-600">Spot fragile businesses before the situation escalates.</p>
            </div>
            <div className="home-mini-card">
              <p className="text-sm font-semibold text-rescue-dark">Recovery playbook</p>
              <p className="mt-1 text-xs text-slate-600">Turn AI diagnosis into concrete weekly action plans.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
