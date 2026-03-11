import { useEffect } from "react";
import { Link } from "react-router-dom";

function Sponsors() {
  useEffect(() => {
    const revealNodes = document.querySelectorAll("[data-sponsor-reveal]");
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
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="home-particle"
            style={{
              left: `${(index * 91) % 100}%`,
              animationDelay: `${(index % 7) * 0.7}s`,
              animationDuration: `${8 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="reveal" data-sponsor-reveal>
          <p className="partner-chip">SPONSOR NETWORK</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-rescue-dark sm:text-5xl lg:text-6xl">
            Sponsors helping teams turn AI insights into real business recovery.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-slate-700 sm:text-lg">
            Our sponsor ecosystem supports innovation, deployment, and impact at scale. Together we accelerate faster
            diagnostics, stronger execution, and measurable turnaround outcomes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="sponsor-card reveal" data-sponsor-reveal>
            <h3 className="text-lg font-bold text-rescue-dark">Technology Sponsors</h3>
            <p className="mt-2 text-sm text-slate-700">
              Cloud, AI, and data infrastructure partners powering secure and scalable operations.
            </p>
          </article>
          <article className="sponsor-card reveal" data-sponsor-reveal>
            <h3 className="text-lg font-bold text-rescue-dark">Community Sponsors</h3>
            <p className="mt-2 text-sm text-slate-700">
              Organizations supporting access, mentorship, and local business recovery initiatives.
            </p>
          </article>
          <article className="sponsor-card reveal" data-sponsor-reveal>
            <h3 className="text-lg font-bold text-rescue-dark">Innovation Sponsors</h3>
            <p className="mt-2 text-sm text-slate-700">
              Forward-looking teams funding experimentation and better crisis-response workflows.
            </p>
          </article>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 reveal" data-sponsor-reveal>
          <Link
            to="/register"
            className="ripple-btn rounded-xl bg-rescue-primary px-6 py-3.5 text-sm font-bold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-rescue-dark"
          >
            Become A Sponsor
          </Link>
          <Link
            to="/partners"
            className="ripple-btn rounded-xl border border-rescue-dark bg-white/80 px-6 py-3.5 text-sm font-bold tracking-wide text-rescue-dark transition hover:-translate-y-0.5 hover:bg-white"
          >
            View Partners
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Sponsors;