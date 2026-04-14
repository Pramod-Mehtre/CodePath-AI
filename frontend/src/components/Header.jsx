import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="saas-header">
      <Link to="/" className="header-logo">
        <span style={{ fontSize: "24px" }}>🚀</span> PrepTracker
      </Link>

      <nav className="header-nav">
        {isAuth && (
          <>
            <Link to="/" className="btn-ghost" style={{ padding: "8px" }}>Dashboard</Link>
            <Link to="/skills" className="btn-ghost" style={{ padding: "8px" }}>Skills</Link>
            <Link to="/jd-analyzer" className="btn-ghost" style={{ padding: "8px" }}>JD Analyzer</Link>
            <Link to="/company-sheet" className="btn-ghost" style={{ padding: "8px" }}>Company Sheets</Link>
            <Link to="/add" className="btn-ghost" style={{ padding: "8px" }}>Add Problem</Link>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: "var(--danger-hover)" }}>
              Logout
            </button>
          </>
        )}
        {!isAuth && (
          <div className="flex gap-2 items-center">
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: "8px 16px" }}>Sign Up</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;