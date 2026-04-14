import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.warning("All fields are required");
    }

    try {
      setLoading(true);
      await API.post("/auth/signup", formData);
      toast.success("Account created successfully!");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="saas-card max-w-400">
        <div className="text-center mb-6">
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Create an account</h1>
          <p>Start tracking your DSA journey</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="auth-form-group">
            <label>Full Name</label>
            <input
              name="name"
              className="saas-input"
              placeholder="sidram H"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
          </div>

          <div className="auth-form-group">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              className="saas-input"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
          </div>

          <div className="auth-form-group mb-6">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="saas-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: "14px" }}>
          Already have an account? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
