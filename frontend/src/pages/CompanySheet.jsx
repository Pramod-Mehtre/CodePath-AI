import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const CompanySheet = () => {
  const [searchParams] = useSearchParams();
  const initCompany = searchParams.get("company") || "Amazon";

  const [company, setCompany] = useState(initCompany);
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState({ solved: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [availableCompanies, setAvailableCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await API.get("/company-problems/companies");
      if (res.data.success && res.data.data.length > 0) {
        setAvailableCompanies(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies list");
    }
  };

  useEffect(() => {
    fetchData();
  }, [company]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, progRes] = await Promise.all([
        API.get(`/company-problems/${company}`),
        API.get(`/company-problems/progress/${company}`)
      ]);
      setProblems(listRes.data.data);
      setProgress(progRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  const markSolved = async (problemId) => {
    try {
      await API.post("/company-problems/solve", { problemId, company });
      toast.success("Problem marked as solved!");
      fetchData(); // refresh to update progress and solved status easily
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark solved");
    }
  };

  // Derive topics for filter
  const allTopics = ["All", ...new Set(problems.map(p => p.topic))];

  // Apply filters
  const filteredProblems = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = difficultyFilter === "All" || p.difficulty === difficultyFilter;
    const matchTopic = topicFilter === "All" || p.topic === topicFilter;
    const matchStatus = statusFilter === "All" || 
                        (statusFilter === "Solved" && p.solved) || 
                        (statusFilter === "Unsolved" && !p.solved);
    return matchSearch && matchDiff && matchTopic && matchStatus;
  });

  return (
    <div className="max-w-900 mt-6">
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "28px" }}>Company DSA Sheet</h2>
          <p style={{ marginTop: "4px" }}>Master frequently asked questions for top tech companies.</p>
        </div>
        <select 
          className="saas-input" 
          style={{ width: "200px" }} 
          value={company} 
          onChange={e => setCompany(e.target.value)}
        >
          {availableCompanies.length === 0 && <option value="Amazon">Amazon</option>}
          {availableCompanies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="saas-card mb-6 flex" style={{ flexDirection: "column", gap: "12px" }}>
        <div className="flex justify-between items-center">
           <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{company} Sheet Progress</h3>
           <span style={{ fontWeight: "700", color: "var(--primary)" }}>{progress.solved} / {progress.total} Solved</span>
        </div>
        <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ 
            height: "100%", 
            backgroundColor: progress.solved === progress.total && progress.total > 0 ? "#10b981" : "#3b82f6", 
            width: `${progress.total > 0 ? (progress.solved / progress.total) * 100 : 0}%`,
            transition: "width 0.5s ease"
          }}></div>
        </div>
      </div>

      <div className="saas-card mb-6 flex" style={{ gap: "12px", flexWrap: "wrap" }}>
         <input 
            type="text" 
            placeholder="Search problems..." 
            className="saas-input" 
            style={{ flex: 1, minWidth: "200px" }} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
         <select className="saas-input" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{ width: "120px" }}>
            <option value="All">All Diff</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
         </select>
         <select className="saas-input" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ width: "120px" }}>
            {allTopics.map(t => <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>)}
         </select>
         <select className="saas-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "120px" }}>
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
         </select>
      </div>

      {loading ? (
        <div className="text-center text-muted mt-6">Loading sheet...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredProblems.length === 0 ? (
             <div className="text-center text-muted" style={{ padding: "40px" }}>No problems match your filters.</div>
          ) : (
             filteredProblems.map(p => (
               <div key={p.id} className="saas-card flex justify-between items-center" style={{ padding: "16px 20px", border: p.solved ? "2px solid #10b981" : "1px solid var(--border-color)", transition: "all 0.2s" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>{p.title}</h3>
                    <div className="flex gap-2 items-center" style={{ fontSize: "12px" }}>
                       <span className={`badge ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                       <span style={{ color: "var(--text-muted)" }}>{p.topic}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <a href={p.link} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: "8px 16px", textDecoration: "none" }}>
                        Solve ↗
                     </a>
                     {p.solved ? (
                        <button className="btn-primary" disabled style={{ backgroundColor: "#10b981", padding: "8px 16px", opacity: 1, cursor: "default" }}>
                           ✔ Solved
                        </button>
                     ) : (
                        <button className="btn-primary" onClick={() => markSolved(p.id)} style={{ padding: "8px 16px" }}>
                           Mark as Solved
                        </button>
                     )}
                  </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySheet;
