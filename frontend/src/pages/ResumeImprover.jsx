import { useState } from "react";
import API from "../services/api";

function ResumeImprover() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const analyzeResume = async () => {
    if (!resumeText) return alert("Please enter your resume text.");
    setLoading(true);
    try {
      const res = await API.post("/resume/improve", { resumeText, targetRole });
      if (res.data.success) {
        setFeedback(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-900" style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>📄 Resume Improvement Engine</h2>
      <div className="saas-card" style={{ marginBottom: "30px" }}>
        <p style={{ marginBottom: "15px", color: "var(--text-muted)" }}>
          Paste your resume text and get AI-powered bullet point rewrites, missing ATS keywords, and structural feedback.
        </p>
        
        <input
          type="text"
          placeholder="Target Role (e.g., Software Engineer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="saas-input"
          style={{ marginBottom: "15px" }}
        />
        
        <textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="saas-input"
          style={{ minHeight: "150px", marginBottom: "20px", resize: "vertical" }}
        />
        
        <button className="btn-primary" onClick={analyzeResume} disabled={loading}>
          {loading ? "Analyzing Resume..." : "Improve Resume"}
        </button>
      </div>

      {feedback && (
        <div className="saas-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ marginBottom: "10px", color: "var(--text-main)" }}>Overall Feedback</h3>
            <p style={{ color: "var(--text-muted)", background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              {feedback.overallFeedback}
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: "10px", color: "var(--text-main)" }}>Missing ATS Keywords</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {feedback.missingKeywords?.map((kw, i) => (
                <span key={i} style={{ background: "#e0e7ff", color: "#4338ca", padding: "6px 12px", borderRadius: "16px", fontSize: "14px", fontWeight: "500" }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: "10px", color: "var(--text-main)" }}>Suggested Rewrites</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {feedback.improvements?.map((imp, i) => (
                <div key={i} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "15px", background: "#ffffff" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                    {imp.category}
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ color: "var(--danger-bg)", fontWeight: "500", fontSize: "14px" }}>Original: </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{imp.original}</span>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ color: "#10b981", fontWeight: "500", fontSize: "14px" }}>Suggestion: </span>
                    <span style={{ color: "var(--text-main)", fontSize: "14px", fontWeight: "500" }}>{imp.suggestion}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
                    Why? {imp.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeImprover;
