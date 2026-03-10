import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="grid items-center gap-8 py-6 md:grid-cols-2">
      <div>
        <p className="mb-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-rescue-dark">
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
          <Link to="/register" className="rounded-lg bg-rescue-primary px-5 py-3 font-semibold text-white hover:bg-rescue-dark">
            Start Now
          </Link>
          <Link to="/login" className="rounded-lg border border-rescue-dark px-5 py-3 font-semibold text-rescue-dark hover:bg-green-50">
            Login
          </Link>
        </div>
      </div>

      <div className="card-surface p-6">
        <h2 className="section-title">What You Get</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          <li>Role-based dashboards for employee, company, and personnel users</li>
          <li>Business risk level classification: Low, Medium, High</li>
          <li>Main problem detection from performance signals</li>
          <li>Actionable AI recovery plans and recommendations</li>
          <li>Optional PDF upload for richer context</li>
        </ul>
      </div>
    </section>
  );
}

export default Home;
