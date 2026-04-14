import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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
    return (
      <div className="max-w-900 text-center" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <h1 style={{ fontSize: "56px", letterSpacing: "-0.03em", marginBottom: "20px", background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Master Data Structures<br />& Algorithms
        </h1>
        <p style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.6" }}>
          The professional way to track your problem-solving journey, analyze your weaknesses, and land your dream tech job.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/signup" className="btn-primary" style={{ padding: "12px 24px", fontSize: "16px" }}>Start Tracking for Free</Link>
          <Link to="/login" className="btn-outline" style={{ padding: "12px 24px", fontSize: "16px" }}>Log in to Account</Link>
        </div>
        
        <div className="mt-6" style={{ marginTop: "60px", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "32px", color: "var(--text-main)", marginBottom: "4px" }}>2,000+</h3>
                <p>Problems Tracked</p>
              </div>
              <div>
                <h3 style={{ fontSize: "32px", color: "var(--text-main)", marginBottom: "4px" }}>98%</h3>
                <p>Success Rate</p>
              </div>
              <div>
                <h3 style={{ fontSize: "32px", color: "var(--text-main)", marginBottom: "4px" }}>14+</h3>
                <p>Supported Platforms</p>
              </div>
           </div>
        </div>
      </div>
    );
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
