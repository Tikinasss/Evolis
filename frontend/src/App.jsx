import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rescue-gray text-slate-700">
        Loading session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-rescue-gray text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
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
