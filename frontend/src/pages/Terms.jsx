import { useEffect } from "react";
import { Link } from "react-router-dom";

function Terms() {
  useEffect(() => {
    const revealNodes = document.querySelectorAll("[data-terms-reveal]");
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
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="home-particle"
            style={{
              left: `${(index * 89) % 100}%`,
              animationDelay: `${(index % 6) * 0.75}s`,
              animationDuration: `${9 + (index % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="reveal" data-terms-reveal>
          <p className="partner-chip">TERMS & CONDITIONS</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-rescue-dark sm:text-5xl">
            Transparent terms for secure and responsible AI usage.
          </h1>
          <p className="mt-5 text-base text-slate-700 sm:text-lg">
            These terms define how the platform should be used, how data is handled, and the responsibilities shared
            between users and operators.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <article className="terms-block reveal" data-terms-reveal>
            <h2 className="text-lg font-bold text-rescue-dark">1. Acceptable Use</h2>
            <p className="mt-2 text-sm text-slate-700">
              Users agree to provide accurate data, avoid abusive behavior, and use generated insights responsibly.
            </p>
          </article>

          <article className="terms-block reveal" data-terms-reveal>
            <h2 className="text-lg font-bold text-rescue-dark">2. Data & Privacy</h2>
            <p className="mt-2 text-sm text-slate-700">
              Uploaded files and business inputs are processed to provide analysis and recommendations. Access is role-
              based and authenticated.
            </p>
          </article>

          <article className="terms-block reveal" data-terms-reveal>
            <h2 className="text-lg font-bold text-rescue-dark">3. Service Availability</h2>
            <p className="mt-2 text-sm text-slate-700">
              We continuously improve uptime and reliability, but temporary disruptions may occur due to third-party
              dependencies or maintenance.
            </p>
          </article>

          <article className="terms-block reveal" data-terms-reveal>
            <h2 className="text-lg font-bold text-rescue-dark">4. Liability</h2>
            <p className="mt-2 text-sm text-slate-700">
              Platform outputs are advisory and should be combined with human decision-making and operational context.
            </p>
          </article>
        </div>

        <div className="mt-8 reveal" data-terms-reveal>
          <Link
            to="/"
            className="ripple-btn inline-flex rounded-xl border border-rescue-dark bg-white/80 px-6 py-3 text-sm font-bold tracking-wide text-rescue-dark transition hover:-translate-y-0.5 hover:bg-white"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Terms;