import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const JDAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fallbackMsg, setFallbackMsg] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (loading) return;
    
    if (!jobDescription.trim()) {
      return toast.error("Please enter a job description.");
    }
    if (!resumeFile) {
      return toast.error("Please upload your resume (PDF).");
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("resume", resumeFile);

    let fallbackTimer;
    let errorShown = false;

    try {
      setLoading(true);
      setFallbackMsg("");
      
      // If it takes more than 4 seconds, we assume it's doing a fallback retry
      fallbackTimer = setTimeout(() => {
        setFallbackMsg("Using backup AI system");
      }, 4000);

      const res = await API.post("/jd/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      clearTimeout(fallbackTimer);
      setResult(res.data.data);
      if (res.data.data.message && res.data.data.message.includes("AI temporarily unavailable")) {
        toast.info("Basic analysis mode (AI busy)");
      } else {
        toast.success("Analysis complete!");
      }
    } catch (error) {
      clearTimeout(fallbackTimer);
      if (!errorShown) {
        const msg = error.response?.data?.message || "Failed to analyze JD";
        if (msg.toLowerCase().includes("busy")) {
          toast.error("AI is busy right now. Please try again.");
        } else {
          toast.error(msg);
        }
        errorShown = true;
      }
    } finally {
      setLoading(false);
      setFallbackMsg("");
    }
  };

  // Helper for rendering a circular progress
  const CircularProgress = ({ score, label, color }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex" style={{ flexDirection: "column", alignItems: "center" }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            stroke="#e2e8f0" strokeWidth="8" fill="none"
          />
          <circle
            cx="50" cy="50" r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
          <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-main)">
            {score}%
          </text>
        </svg>
        <span style={{ marginTop: "8px", fontWeight: "600", fontSize: "14px", color: "var(--text-muted)" }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-900 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: "28px" }}>JD Analyzer</h2>
          <p style={{ marginTop: "4px" }}>Compare your resume against any Job Description using our Smart Engine.</p>
        </div>
      </div>

      <div className="saas-card mb-6">
        <h3 className="mb-4">1. Upload Resume</h3>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          className="saas-input mb-4" 
          style={{ cursor: "pointer" }}
        />

        <h3 className="mb-4">2. Paste Job Description</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="saas-input mb-4"
          placeholder="Paste the full job description here..."
          rows="6"
          style={{ resize: "vertical" }}
        ></textarea>

        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="btn-primary" 
          style={{ width: "100%", padding: "14px", fontSize: "16px" }}
        >
          {loading ? (fallbackMsg ? fallbackMsg : "Analyzing your profile...") : "Analyze Fit"}
        </button>
      </div>

      {result && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-grid mb-6">
            <div className="saas-card flex" style={{ justifyContent: "space-around", alignItems: "center" }}>
               <CircularProgress score={result.atsScore} label="ATS Score (Est.)" color={result.atsScore > 75 ? "#10b981" : result.atsScore > 50 ? "#f59e0b" : "#ef4444"} />
               <CircularProgress score={result.jobFitScore} label="Job Fit Score" color={result.jobFitScore > 75 ? "#3b82f6" : "#a855f7"} />
            </div>

            <div className="saas-card flex" style={{ flexDirection: "column", justifyContent: "space-between" }}>
               <div>
                 <h3 className="mb-4" style={{ fontSize: "16px" }}>Actionable Suggestions</h3>
                 <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
                 
                 <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                   <button 
                     onClick={() => navigate("/roadmap", { state: { ...result, autoGenerate: true } })} 
                     className="btn-outline" 
                     style={{ flex: 1 }}>
                     🗺️ Gen Prep Roadmap
                   </button>
                 </div>
               </div>

               {result.recommendedCompany && (
                 <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <h4 style={{ color: "#2563eb", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>💡 Recommended Practice</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Based on your JD analysis, focus on <strong>{result.dsaRecommendation?.difficulty || "medium"}</strong>-level problems from <strong>{result.recommendedCompany}</strong> interview sets.
                    </p>
                    {result.missingSkills && result.missingSkills.length > 0 && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                        Priority areas: {result.missingSkills.slice(0, 3).join(", ")}
                      </p>
                    )}
                    <button onClick={() => navigate(`/company-sheet?company=${encodeURIComponent(result.recommendedCompany)}`)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                       Start {result.recommendedCompany} Practice ↗
                    </button>
                 </div>
               )}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="saas-card">
              <h3 className="mb-4" style={{ fontSize: "16px" }}>✅ Matched Skills</h3>
              <div className="flex" style={{ flexWrap: "wrap", gap: "8px" }}>
                {result.matchedSkills.length > 0 ? result.matchedSkills.map(s => (
                  <span key={s} style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>{s}</span>
                )) : <span className="text-muted">None detected.</span>}
              </div>

              <h3 className="mb-4 mt-6" style={{ fontSize: "16px" }}>⭐ Identified Strengths</h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                 {result.strengths.length > 0 ? result.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No specific strengths extracted.</li>}
              </ul>
            </div>

            <div className="saas-card">
              <h3 className="mb-4" style={{ fontSize: "16px" }}>❌ Missing Skills</h3>
              <div className="flex" style={{ flexWrap: "wrap", gap: "8px" }}>
                {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                  <span key={s} style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>{s}</span>
                )) : <span className="text-muted">None! You seem to cover everything.</span>}
              </div>

              <h3 className="mb-4 mt-6" style={{ fontSize: "16px" }}>📉 Potential Weaknesses</h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                 {result.weaknesses.length > 0 ? result.weaknesses.map((s, i) => <li key={i}>{s}</li>) : <li>No critical weaknesses found.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDAnalyzer;
