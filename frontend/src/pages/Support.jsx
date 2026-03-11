import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sendSupportMessage } from "../api/client";

const categories = [
  { value: "account-access", label: "Account access" },
  { value: "billing", label: "Billing" },
  { value: "analysis-quality", label: "Analysis quality" },
  { value: "bug-report", label: "Bug report" },
  { value: "feature-request", label: "Feature request" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const initialForm = {
  name: "",
  email: "",
  subject: "",
  category: "bug-report",
  message: "",
};

function Support() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const revealNodes = document.querySelectorAll("[data-support-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => {
      revealNodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendSupportMessage(form);
      setSuccess("Your message was sent successfully. Our support team will reply soon.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Unable to send your message right now.");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal" data-support-reveal>
          <p className="partner-chip">SUPPORT CENTER</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-rescue-dark sm:text-5xl">
            Tell us your issue, we will route it to the right team.
          </h1>
          <p className="mt-4 text-base text-slate-700 sm:text-lg">
            Choose a category, describe your issue, and submit your request. We contact you by email as soon as
            possible.
          </p>

          <div className="mt-7 space-y-3">
            <div className="support-category-pill">Account access and login issues</div>
            <div className="support-category-pill">Billing and subscription questions</div>
            <div className="support-category-pill">Bug report and technical incidents</div>
            <div className="support-category-pill">Feature requests and product feedback</div>
            <div className="support-category-pill">Security and privacy concerns</div>
          </div>

          <Link
            to="/"
            className="ripple-btn mt-7 inline-flex rounded-xl border border-rescue-dark bg-white/80 px-5 py-3 text-sm font-bold tracking-wide text-rescue-dark transition hover:-translate-y-0.5 hover:bg-white"
          >
            Back To Home
          </Link>
        </div>

        <form className="support-form reveal" data-support-reveal onSubmit={handleSubmit}>
          <h2 className="text-xl font-black text-rescue-dark">Send a support request</h2>

          {error && <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="mt-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-rescue-dark">{success}</p>}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="support-field">
              <span>Name</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </label>

            <label className="support-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
              />
            </label>

            <label className="support-field sm:col-span-2">
              <span>Subject</span>
              <input
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder="Short summary of your issue"
              />
            </label>

            <label className="support-field sm:col-span-2">
              <span>Category</span>
              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="support-field sm:col-span-2">
              <span>Your request</span>
              <textarea
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your issue with as much detail as possible..."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ripple-btn mt-5 inline-flex rounded-xl bg-rescue-primary px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-rescue-dark disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Support;