import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState([]);

  useEffect(() => {
    // If we have state from JD analyzer, auto-generate
    if (location.state && location.state.autoGenerate) {
      generateRoadmap(location.state);
    }
  }, []);

  const generateRoadmap = async (data) => {
    setLoading(true);
    try {
      const res = await API.post("/roadmap/generate", {
        skills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
        targetCompany: data.recommendedCompany || "a top tech company",
        jobRole: "Software Engineer"
      });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-900" style={{ marginTop: "30px", textAlign: "center" }}>
        <h2>Generating your personalized roadmap...</h2>
        <p style={{ color: "var(--text-muted)" }}>This may take a few moments.</p>
      </div>
    );
  }

  return (
    <div className="max-w-900" style={{ marginTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>🗺️ AI Preparation Roadmap</h2>
        <button className="btn-outline" onClick={() => navigate("/jd-analyzer")}>
          ← Back to JD Analyzer
        </button>
      </div>

      {!roadmap.length ? (
        <div className="saas-card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            No roadmap generated yet. Please analyze a JD first.
          </p>
          <button className="btn-primary" onClick={() => navigate("/jd-analyzer")}>
            Go to JD Analyzer
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {roadmap.map((week, index) => (
            <div key={index} className="saas-card" style={{ borderLeft: "4px solid #4f46e5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "var(--text-main)" }}>{week.week}</h3>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#4f46e5", background: "#eef2ff", padding: "4px 12px", borderRadius: "16px" }}>
                  Focus: {week.focus}
                </span>
              </div>
              <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", marginBottom: 0 }}>
                {week.topics?.map((topic, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>{topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Roadmap;
