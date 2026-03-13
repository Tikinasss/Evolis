import { useState } from "react";
import { Link } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function LoginForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h2 className="mb-4 text-xl font-semibold text-rescue-dark">Login</h2>

      <div className="mb-4">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
      </div>

      <div className="mb-5 text-right">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-rescue-primary hover:text-rescue-dark"
        >
          Forgot your password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-rescue-primary px-4 py-2 font-semibold text-white hover:bg-rescue-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default LoginForm;
