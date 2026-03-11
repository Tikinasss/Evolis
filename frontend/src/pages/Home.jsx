import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function useCountUp(target, duration, start) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    let frame = null;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [target, duration, start]);

  return value;
}

function Home() {
  const heroRef = useRef(null);
  const [startCounters, setStartCounters] = useState(false);
  const businessesSaved = useCountUp(320, 1300, startCounters);
  const avgRecovery = useCountUp(87, 1500, startCounters);
  const actionPlans = useCountUp(1200, 1650, startCounters);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) {
      return;
    }

    const onMouseMove = (event) => {
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      section.style.setProperty("--cursor-x", `${x}px`);
      section.style.setProperty("--cursor-y", `${y}px`);
    };

    section.addEventListener("mousemove", onMouseMove);
    return () => section.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const revealNodes = document.querySelectorAll("[data-reveal]");
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

  useEffect(() => {
    const node = heroRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStartCounters(true);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    button.style.setProperty("--ripple-x", `${x}px`);
    button.style.setProperty("--ripple-y", `${y}px`);
    button.classList.remove("is-rippling");
    requestAnimationFrame(() => {
      button.classList.add("is-rippling");
    });
  };

  const particles = Array.from({ length: 22 });

  return (
    <section ref={heroRef} className="home-hero-xl relative overflow-hidden rounded-[2rem] px-5 py-12 sm:px-8 md:px-12">
      <div className="home-cursor-glow" />
      <div className="home-grid-overlay" />
      <div className="home-particles" aria-hidden="true">
        {particles.map((_, index) => (
          <span
            key={index}
            className="home-particle"
            style={{
              left: `${(index * 97) % 100}%`,
              animationDelay: `${(index % 7) * 0.7}s`,
              animationDuration: `${8 + (index % 6)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="reveal" data-reveal>
          <p className="mb-4 inline-flex rounded-full border border-green-200 bg-white/75 px-4 py-1.5 text-sm font-semibold text-rescue-dark backdrop-blur">
            AI TURNAROUND PLATFORM
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-rescue-dark sm:text-5xl lg:text-6xl">
            Bigger visibility. Faster decisions. Better business rescue outcomes.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-700 sm:text-lg">
            Detect risk patterns, understand root causes, and launch role-based action plans with smart AI guidance.
            Everything in one interactive workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              onMouseDown={handleRipple}
              className="ripple-btn rounded-xl bg-rescue-primary px-6 py-3.5 text-sm font-bold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-rescue-dark"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              onMouseDown={handleRipple}
              className="ripple-btn rounded-xl border border-rescue-dark bg-white/80 px-6 py-3.5 text-sm font-bold tracking-wide text-rescue-dark transition hover:-translate-y-0.5 hover:bg-white"
            >
              Explore Platform
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="home-stat-xxl">
              <p className="text-3xl font-black text-rescue-dark">{businessesSaved}+</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">businesses assessed</p>
            </div>
            <div className="home-stat-xxl">
              <p className="text-3xl font-black text-rescue-dark">{avgRecovery}%</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">recovery confidence</p>
            </div>
            <div className="home-stat-xxl">
              <p className="text-3xl font-black text-rescue-dark">{actionPlans}+</p>
              <p className="text-xs uppercase tracking-wide text-slate-600">action plans generated</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="home-side-panel reveal" data-reveal>
            <h2 className="section-title">What You Unlock</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="home-feature-item">Role-based dashboards for employee, company, and personnel teams</li>
              <li className="home-feature-item">Low, Medium, High risk AI classification with confidence signals</li>
              <li className="home-feature-item">Clear root-cause diagnostics from business performance trends</li>
              <li className="home-feature-item">Actionable recovery plans and collaborative follow-up workflows</li>
              <li className="home-feature-item">Upload PDF context for richer and more reliable analysis</li>
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 reveal" data-reveal>
            <div className="home-mini-card-advanced">
              <p className="text-sm font-semibold text-rescue-dark">Risk radar</p>
              <p className="mt-1 text-xs text-slate-600">Spot fragile businesses before the situation escalates.</p>
            </div>
            <div className="home-mini-card-advanced">
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
