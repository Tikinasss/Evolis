import { useState } from "react";

const initialState = {
  companyName: "",
  industry: "",
  revenueChange: "",
  debt: "",
  reviewTrend: "stable",
  document: null,
};

function BusinessForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, document: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h3 className="section-title mb-4">Business Diagnostic Input</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="companyName"
          placeholder="Company name"
          required
          value={form.companyName}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
        <input
          name="industry"
          placeholder="Industry"
          required
          value={form.industry}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
        <input
          name="revenueChange"
          placeholder="Revenue change (%)"
          required
          value={form.revenueChange}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
        <input
          name="debt"
          placeholder="Debt amount"
          required
          value={form.debt}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
        <select
          name="reviewTrend"
          value={form.reviewTrend}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="improving">Improving</option>
          <option value="stable">Stable</option>
          <option value="decreasing">Decreasing</option>
        </select>
        <input
          name="document"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-lg bg-rescue-primary px-5 py-2 font-semibold text-white hover:bg-rescue-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Analyzing..." : "Analyze Business"}
      </button>
    </form>
  );
}

export default BusinessForm;
