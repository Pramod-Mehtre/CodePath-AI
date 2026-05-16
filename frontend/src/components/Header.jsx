import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import Logo from "./Logo";

function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className={`saas-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <NavLink to="/" className="header-logo" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo size={28} />
          <span style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em" }}>PrepTracker</span>
        </NavLink>

        <nav className="header-nav">
          {isAuth ? (
            <button onClick={handleLogout} className="btn-nav-login" style={{ color: "#ef4444" }}>
              Logout
            </button>
          ) : (
            <div className="auth-group">
              <NavLink to="/login" className="btn-nav-login">
                Log in
              </NavLink>
              <NavLink to="/signup" className="btn-nav-signup">
                Sign Up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
