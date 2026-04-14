import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function AddProblem() {
  const [form, setForm] = useState({ title: "", topic: "", difficulty: "Easy", platform: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.topic || !form.platform) {
      return toast.warning("Please fill all required fields");
    }

    try {
      setLoading(true);
      await API.post("/dsa/add", form);
      toast.success("Problem added successfully!");
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-400" style={{ marginTop: "40px" }}>
      <div className="saas-card hoverable">
        <div className="mb-6">
          <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Add New Problem</h2>
          <p>Track a new DSA question you solved.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>Problem Title</label>
            <input name="title" className="saas-input" placeholder="e.g. Two Sum" value={form.title} onChange={handleChange} />
          </div>

          <div className="mb-4">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>Topic</label>
            <input name="topic" className="saas-input" placeholder="e.g. Arrays, Hash Table" value={form.topic} onChange={handleChange} />
          </div>

          <div className="mb-4">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>Difficulty</label>
            <select name="difficulty" className="saas-input" value={form.difficulty} onChange={handleChange}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="mb-6">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>Platform</label>
            <input name="platform" className="saas-input" placeholder="e.g. LeetCode" value={form.platform} onChange={handleChange} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/")} className="btn-outline w-full">Cancel</button>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Adding..." : "Add Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProblem;