import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Landing from "../pages/Landing";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return (
    <div className="flex items-center justify-center" style={{ height: "60vh" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>Loading...</p>
    </div>
  );

  if (isAuthenticated) return children;

  const isDashboard = window.location.pathname === "/";

  if (isDashboard) {
    return <Landing />;
  }

  return (
    <div className="max-w-400 text-center" style={{ marginTop: "80px" }}>
      <div className="saas-card">
        <h2 className="mb-2">Access Restricted</h2>
        <p className="mb-6">Please log in to your account to view this page and access your tracking data.</p>
        <Link to="/login" className="btn-primary w-full">Log In</Link>
      </div>
    </div>
  );
}

export default ProtectedRoute;
