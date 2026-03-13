import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Partners from "./pages/Partners";
import Sponsors from "./pages/Sponsors";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  const isFullBleedPage =
    (!isAuthenticated && location.pathname === "/") ||
    location.pathname === "/partners" ||
    location.pathname === "/sponsors" ||
    location.pathname === "/support" ||
    location.pathname === "/terms";

  if (initializing) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rescue-gray px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(22,101,52,0.14),transparent_30%)]" />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-green-100 bg-white/90 px-6 py-8 shadow-panel backdrop-blur">
          <div className="loader-orbit mb-4" aria-hidden="true">
            <span className="loader-orbit-ring" />
            <span className="loader-orbit-core" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-rescue-dark">Preparing your workspace...</p>
          <p className="mt-1 text-xs text-slate-500">Syncing secure Firebase session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-rescue-gray text-slate-900">
      <Navbar />
      <main
        className={
          isFullBleedPage
            ? "w-full flex-1"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
        }
      >
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
          <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employee", "company", "personnel"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
