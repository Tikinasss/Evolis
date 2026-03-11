import { useEffect } from "react";
import { Link } from "react-router-dom";
import awsLogo from "./logo_aws.webp";

function Partners() {
  useEffect(() => {
    const revealNodes = document.querySelectorAll("[data-partner-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    revealNodes.forEach((node) => observer.observe(node));

    return () => {
      revealNodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, []);

  return (
    <section className="partner-hero relative min-h-[calc(100vh-4.75rem)] w-full overflow-hidden px-5 py-14 sm:px-8 md:px-12 lg:px-16">
      <div className="home-grid-overlay" />
      <div className="home-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="home-particle"
            style={{
              left: `${(index * 93) % 100}%`,
              animationDelay: `${(index % 8) * 0.65}s`,
              animationDuration: `${9 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="reveal" data-partner-reveal>
          <p className="partner-chip">PARTNER SPOTLIGHT</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-rescue-dark sm:text-5xl lg:text-6xl">
            AWS powers our AI analysis engine from insight to action.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-700 sm:text-lg">
            We partner with AWS to deliver secure, scalable and production-ready intelligence for teams rescuing
            businesses. Amazon Nova helps transform raw business signals into clear recovery strategies.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="partner-kpi">
              <p className="text-3xl font-black text-rescue-dark">99.9%</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">service reliability target</p>
            </div>
            <div className="partner-kpi">
              <p className="text-3xl font-black text-rescue-dark">Global</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">cloud infrastructure</p>
            </div>
            <div className="partner-kpi">
              <p className="text-3xl font-black text-rescue-dark">AI</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">nova capabilities</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="ripple-btn rounded-xl bg-rescue-primary px-6 py-3.5 text-sm font-bold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-rescue-dark"
            >
              Start With AWS Stack
            </Link>
            <Link
              to="/"
              className="ripple-btn rounded-xl border border-rescue-dark bg-white/80 px-6 py-3.5 text-sm font-bold tracking-wide text-rescue-dark transition hover:-translate-y-0.5 hover:bg-white"
            >
              Back To Home
            </Link>
          </div>
        </div>

        <div className="reveal" data-partner-reveal>
          <div className="partner-logo-shell">
            <img src={awsLogo} alt="AWS logo" className="partner-logo" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="home-mini-card-advanced">
              <p className="text-sm font-semibold text-rescue-dark">Secure by design</p>
              <p className="mt-1 text-xs text-slate-600">Built with robust cloud security practices and modern identity flows.</p>
            </div>
            <div className="home-mini-card-advanced">
              <p className="text-sm font-semibold text-rescue-dark">Scale with confidence</p>
              <p className="mt-1 text-xs text-slate-600">From startup pilots to enterprise workflows with strong performance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Partners;