import { useState, useEffect } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("strongest");
  const toast = useToast();

  useEffect(() => {
    const fetchSkillsAnalysis = async () => {
      try {
        setLoading(true);
        const res = await API.get("/skills/analysis");
        setSkills(res.data.skills);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch skills analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsAnalysis();
  }, []);

  const getSortedSkills = () => {
    return [...skills].sort((a, b) => {
      if (sortBy === "strongest") {
        return b.count - a.count;
      } else {
        return a.count - b.count;
      }
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "#94a3b8"; // gray
      case "Intermediate": return "#fbbf24"; // yellow
      case "Advanced": return "#10b981"; // green
      default: return "#94a3b8";
    }
  };

  const getProgressPercentage = (count) => {
    // Let's assume 20 is the cap for "100%" visual progress
    const cap = 20;
    const percentage = (count / cap) * 100;
    return percentage > 100 ? 100 : percentage;
  };

  return (
    <div className="max-w-900 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: "28px" }}>Skill Analysis</h2>
          <p style={{ marginTop: "4px" }}>Auto-calculated based on your solved problems.</p>
        </div>
        <div>
          <select 
            className="saas-input" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="strongest">Sort by Strongest</option>
            <option value="weakest">Sort by Weakest</option>
          </select>
        </div>
      </div>

      <div className="saas-card">
        {loading ? (
          <p className="text-muted text-center" style={{ padding: "40px 0" }}>Analyzing your skills...</p>
        ) : skills.length === 0 ? (
          <div className="text-center" style={{ padding: "40px 0" }}>
            <span style={{ fontSize: "40px", opacity: 0.5 }}>📊</span>
            <p style={{ marginTop: "12px", fontWeight: "500", color: "var(--text-muted)" }}>Solve problems to see your skill analysis!</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {getSortedSkills().map((skill) => (
              <div key={skill.topic} className="saas-card hoverable">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="problem-title" style={{ fontSize: "18px" }}>{skill.topic}</h4>
                  <span 
                    style={{ 
                      padding: "4px 10px", 
                      borderRadius: "20px", 
                      fontSize: "12px", 
                      fontWeight: "600",
                      backgroundColor: `${getLevelColor(skill.level)}20`,
                      color: getLevelColor(skill.level)
                    }}
                  >
                    {skill.level}
                  </span>
                </div>
                
                <div className="mb-2 flex justify-between items-center">
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Problems Solved</span>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{skill.count}</span>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${getProgressPercentage(skill.count)}%`, 
                      backgroundColor: getLevelColor(skill.level),
                      transition: "width 0.5s ease-in-out"
                    }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {skill.level === "Advanced" ? "Mastered" : skill.level === "Intermediate" ? "Goal: 16+" : "Goal: 6+"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
