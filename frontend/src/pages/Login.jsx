import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    API.get("/auth/me")
      .then(() => navigate("/"))
      .catch(() => {});
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning("Enter email and password");
    }

    try {
      setLoading(true);
      await API.post("/auth/login", { email, password });
      toast.success("Login successful");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="saas-card max-w-400">
        <div className="text-center mb-6">
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label>Email address</label>
            <input
              type="email"
              className="saas-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-form-group mb-6">
            <label>Password</label>
            <input
              type="password"
              className="saas-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: "14px" }}>
          Don't have an account? <Link to="/signup" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;