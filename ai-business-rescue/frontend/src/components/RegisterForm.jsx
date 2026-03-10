import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "employee",
};

function RegisterForm({ onSubmit, loading }) {
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
      <h2 className="mb-4 text-xl font-semibold text-rescue-dark">Create Account</h2>

      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        />
      </div>

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

      <div className="mb-4">
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

      <div className="mb-5">
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-rescue-primary focus:ring-2"
        >
          <option value="employee">Employee</option>
          <option value="company">Company</option>
          <option value="personnel">Personnel (Admin)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-rescue-primary px-4 py-2 font-semibold text-white hover:bg-rescue-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;
