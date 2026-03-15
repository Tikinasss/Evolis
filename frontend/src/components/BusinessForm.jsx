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
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, document: file }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!form.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (form.revenueChange === "") {
      newErrors.revenueChange = "Revenue change is required";
    } else if (isNaN(Number(form.revenueChange))) {
      newErrors.revenueChange = "Must be a valid number";
    }

    if (form.debt === "") {
      newErrors.debt = "Debt amount is required";
    } else if (isNaN(Number(form.debt))) {
      newErrors.debt = "Must be a valid number";
    } else if (Number(form.debt) < 0) {
      newErrors.debt = "Debt cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h3 className="section-title mb-4">Business Diagnostic Input</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <input
            name="companyName"
            placeholder="Company name"
            required
            value={form.companyName}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none ring-rescue-primary focus:ring-2 ${
              errors.companyName ? "border-red-500 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <input
            name="industry"
            placeholder="Industry"
            required
            value={form.industry}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none ring-rescue-primary focus:ring-2 ${
              errors.industry ? "border-red-500 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.industry && (
            <p className="mt-1 text-xs text-red-600">{errors.industry}</p>
          )}
        </div>

        <div>
          <input
            name="revenueChange"
            type="number"
            placeholder="Revenue change (%)"
            required
            value={form.revenueChange}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none ring-rescue-primary focus:ring-2 ${
              errors.revenueChange ? "border-red-500 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.revenueChange && (
            <p className="mt-1 text-xs text-red-600">{errors.revenueChange}</p>
          )}
        </div>

        <div>
          <input
            name="debt"
            type="number"
            placeholder="Debt amount ($)"
            required
            value={form.debt}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 outline-none ring-rescue-primary focus:ring-2 ${
              errors.debt ? "border-red-500 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.debt && (
            <p className="mt-1 text-xs text-red-600">{errors.debt}</p>
          )}
        </div>

        <select
          name="reviewTrend"
          value={form.reviewTrend}
          onChange={handleChange}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="improving">Improving</option>
          <option value="stable">Stable</option>
          <option value="decreasing">Decreasing</option>
          <option value="negative">Negative</option>
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
