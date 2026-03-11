import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function linkClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-green-100 text-rescue-dark" : "text-slate-700 hover:bg-green-50 hover:text-rescue-dark"
  }`;
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-rescue-dark">
          AI Business Rescue
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <span className="hidden rounded-lg bg-green-50 px-3 py-2 text-sm text-rescue-dark sm:inline-block">
                {user?.name} ({user?.role})
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-rescue-primary px-3 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
