import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import Logo from "../components/Logo";

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const [stats, setStats] = useState({
    problemsTracked: 0,
    activeUsers: 0,
    roadmapsCreated: 0,
    analysesCompleted: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get("/public/stats");
      // The new public endpoint returns the stats directly in the body
      setStats(res.data);
      setLoadingStats(false);
    } catch (error) {
      console.error("Failed to fetch stats");
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchStats();

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsInView(true);
      }
    }, { threshold: 0.2 });

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => {
      if (statsSection) observer.unobserve(statsSection);
    };
  }, []);

  const formatStat = (num) => {
    if (num === 0) return "0+";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k+";
    }
    return num + "+";
  };

  const CompanyLogo = ({ name, path, color, multiColor }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", transition: "all 0.3s ease", cursor: "pointer" }} className="company-logo-item">
       <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {multiColor ? (
            multiColor
          ) : (
            <svg width="42" height="42" viewBox="0 0 24 24" fill={color} style={{ display: "block" }}>
               <path d={path} />
            </svg>
          )}
       </div>
       <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px" }}>{name}</span>
    </div>
  );

  const companies = [
    { 
      name: "Amazon", 
      color: "#FF9900",
      path: "M15.93 17.01c-2.68 1.88-6.23 2.87-9.71 2.87-4.7 0-8.94-1.84-11.77-4.72l.96-.8c2.5 2.53 6.3 4.14 10.5 4.14 3.12 0 6.34-.85 8.94-2.48l1.08.99zM16.32 16.14l-.94-1.16c.38-.28.7-.63 1-.95.42-.42.7-.85 1.05-1.32.42-.55.7-1.15.84-1.75.14-.55.14-1.08.07-1.61-.07-.55-.28-1.01-.63-1.47-.35-.42-.84-.71-1.33-.85-.49-.14-1.05-.14-1.54-.07-.49.07-.98.28-1.4.56-.35.28-.7.63-1 .98-.28.35-.49.71-.63 1.12-.14.42-.14.84-.14 1.26 0 .42.07.84.21 1.26.14.42.35.84.56 1.26.28.42.56.77.84 1.05.28.28.63.49.98.7l-.98 1.12c-.49-.28-.98-.63-1.4-1.05-.42-.42-.77-.91-1.12-1.4-.35-.49-.63-1.05-.84-1.61-.14-.56-.21-1.19-.21-1.82s.07-1.26.28-1.89c.21-.63.56-1.19.98-1.75.42-.56.98-1.05 1.61-1.4.63-.35 1.4-.56 2.17-.63.84-.07 1.68.07 2.45.35.77.28 1.47.77 2.03 1.4.56.63.91 1.4 1.05 2.24.14.84.07 1.75-.21 2.59-.28.84-.7 1.61-1.26 2.31-.56.7-1.26 1.26-2.03 1.68-.7.42-1.47.77-2.31.91z" 
    },
    { 
      name: "Microsoft", 
      multiColor: (
        <svg width="42" height="42" viewBox="0 0 23 23">
          <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      )
    },
    { 
      name: "Google", 
      multiColor: (
        <svg width="42" height="42" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    },
    { 
      name: "Adobe", 
      color: "#FF0000",
      path: "M13.966 22.624l-1.69-4.281h-3.32l-1.69 4.281H0V1.376h11.4v4.524H4.524v11.4H6.78l5.624-14.124h4.814l5.624 14.124h2.256V5.9h-6.876V1.376H24v21.248z" 
    },
    { 
      name: "Walmart", 
      color: "#0071CE",
      path: "M23.1 11.1c.3.5.3 1.2 0 1.7l-3.3 5.7c-.3.5-1 .8-1.5.8h-6.6c-.6 0-1.2-.3-1.5-.8L6.9 12.8c-.3-.5-.3-1.2 0-1.7l3.3-5.7c.3-.5 1-.8 1.5-.8h6.6c.6 0 1.2.3 1.5.8l3.3 5.7zM15 12c0-.6-.4-1-1-1s-1 .4-1 1 .4 1 1 1 1-.4 1-1z" 
    },
    { 
      name: "Infosys", 
      color: "#007CC3",
      path: "M24 0H0v24h24V0zM12 18.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5zm0-11c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z" 
    }
  ];

  return (
    <div className="landing-container" style={{ background: "#ffffff", color: "var(--text-main)", overflow: "hidden" }}>
      {/* SECTION 1: HERO SECTION - Light Gray Background */}
      <section className="hero-section bg-soft-gray" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div className={`hero-content ${isVisible ? 'fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0, transition: "all 1s cubic-bezier(0.2, 1, 0.3, 1)" }}>
          <h1 style={{ 
            fontSize: "clamp(44px, 6vw, 72px)", 
            lineHeight: "1.05", 
            letterSpacing: "-0.04em", 
            fontWeight: "800", 
            marginBottom: "28px",
            color: "#0f172a"
          }}>
            Master DSA.<br />
            Crack Interviews.<br />
            <span style={{ color: "#3b82f6" }}>Track Everything.</span>
          </h1>
          <p style={{ 
            fontSize: "21px", 
            color: "#475569", 
            lineHeight: "1.6", 
            marginBottom: "48px",
            maxWidth: "540px"
          }}>
            The professional AI platform built to help you track progress, optimize resumes, and master top tech company sheets.
          </p>
          <div className="flex gap-4">
            <Link to="/signup" className="btn-primary" style={{ padding: "18px 36px", fontSize: "18px", borderRadius: "14px" }}>
              Start Tracking Free
            </Link>
            <Link to="/login" className="btn-outline" style={{ padding: "18px 36px", fontSize: "18px", borderRadius: "14px", background: "#fff", border: "1px solid #e2e8f0", color: "#1e293b" }}>
              Explore Features
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-4" style={{ marginTop: "56px" }}>
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ 
                    width: "34px", 
                    height: "34px", 
                    borderRadius: "50%", 
                    border: "2.5px solid #fff", 
                    background: `hsl(${i * 65}, 65%, 85%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                  }}>👤</div>
                ))}
             </div>
             <p style={{ fontSize: "15px", color: "#64748b", fontWeight: "500" }}>
               Trusted by over <strong>{loadingStats ? "..." : stats.activeUsers.toLocaleString()}</strong> engineers
             </p>
          </div>
        </div>

        {/* RIGHT SIDE: PRODUCT MOCKUP */}
        <div className="hero-mockup" style={{ position: "relative", height: "550px" }}>
          {/* Main Dashboard Card */}
          <div className="mockup-card main-dashboard" style={{
            width: "420px",
            height: "320px",
            background: "#fff",
            borderRadius: "24px",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(226, 232, 240, 0.7)",
            padding: "28px",
            position: "absolute",
            zIndex: 2,
            top: "60px",
            left: "20px",
            animation: "float 6s ease-in-out infinite"
          }}>
             <div className="flex justify-between items-center mb-8">
                <div style={{ width: "100px", height: "10px", background: "#f1f5f9", borderRadius: "5px" }}></div>
                <div style={{ width: "28px", height: "28px", background: "#f1f5f9", borderRadius: "50%" }}></div>
             </div>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ height: "110px", background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)", borderRadius: "16px", padding: "20px" }}>
                   <div style={{ width: "45%", height: "6px", background: "#3b82f6", opacity: 0.15, marginBottom: "10px" }}></div>
                   <div style={{ width: "80%", height: "14px", background: "#3b82f6", borderRadius: "5px" }}></div>
                </div>
                <div style={{ height: "110px", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", borderRadius: "16px", padding: "20px" }}>
                   <div style={{ width: "45%", height: "6px", background: "#10b981", opacity: 0.15, marginBottom: "10px" }}></div>
                   <div style={{ width: "80%", height: "14px", background: "#10b981", borderRadius: "5px" }}></div>
                </div>
             </div>
             <div className="mt-8">
                <div style={{ width: "100%", height: "70px", background: "#f8fafc", borderRadius: "16px", display: "flex", alignItems: "center", padding: "0 20px", gap: "16px" }}>
                   <div style={{ width: "36px", height: "36px", background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}></div>
                   <div style={{ flex: 1, height: "10px", background: "#e2e8f0", borderRadius: "5px" }}></div>
                   <div style={{ width: "50px", height: "20px", background: "#3b82f615", borderRadius: "12px" }}></div>
                </div>
             </div>
          </div>

          {/* Floating ATS Card */}
          <div className="mockup-card ats-card" style={{
            width: "240px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            padding: "24px",
            position: "absolute",
            zIndex: 3,
            top: "240px",
            right: "20px",
            animation: "float 8s ease-in-out infinite reverse"
          }}>
             <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "16px", letterSpacing: "1px" }}>MATCH SCORE</p>
             <div className="flex items-center gap-5">
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "5px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "#065f46" }}>85%</div>
                <div>
                   <div style={{ width: "90px", height: "10px", background: "#10b981", borderRadius: "5px", marginBottom: "6px" }}></div>
                   <div style={{ width: "60px", height: "6px", background: "#f1f5f9", borderRadius: "3px" }}></div>
                </div>
             </div>
          </div>

          {/* Floating Streak Card */}
          <div className="mockup-card streak-card" style={{
            padding: "16px 24px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            position: "absolute",
            zIndex: 4,
            top: "320px",
            left: "-40px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            animation: "float 5s ease-in-out infinite 0.5s"
          }}>
             <span style={{ fontSize: "24px" }}>🔥</span>
             <div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>12 Days</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>STREAK</div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION: COMPANY SHOWCASE - White Background */}
      <section className="bg-white" style={{ padding: "80px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
           <p style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "48px" }}>Trusted by students aiming for top tech</p>
           <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "80px", alignItems: "center" }}>
              {companies.map((c, i) => (
                <CompanyLogo key={i} name={c.name} path={c.path} color={c.color} multiColor={c.multiColor} />
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES - Ultra Light Blue Tint Background */}
      <section className="bg-soft-blue" style={{ padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "20px", color: "#0f172a", letterSpacing: "-0.03em" }}>Built for professional preparation.</h2>
            <p style={{ color: "#475569", fontSize: "20px", maxWidth: "640px", margin: "0 auto", lineHeight: "1.6" }}>The unified workspace for your entire technical interview lifecycle.</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "32px" }}>
            {[
              { icon: "📈", title: "Automated Tracking", desc: "Never lose track of your progress. Sync your problems across platforms effortlessly." },
              { icon: "📄", title: "AI-Powered Analysis", desc: "Get professional-grade feedback and ATS score optimization for every role." },
              { icon: "🏢", title: "Company Blueprints", desc: "Access the exact question blueprints used by FAANG and top-tier startups." },
              { icon: "🗺️", title: "Dynamic Roadmaps", desc: "Your preparation is unique. Get a roadmap that adapts to your skills and goals." },
              { icon: "🧠", title: "Deep Weakness Insights", desc: "AI identifies your core weaknesses and suggests the perfect practice problems." },
              { icon: "🎙️", title: "Interview Simulation", desc: "Generate realistic interview environments tailored to specific tech companies." }
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ 
                background: "#fff", 
                padding: "44px", 
                borderRadius: "28px", 
                border: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
              }}>
                <div className="feature-icon" style={{ fontSize: "40px", marginBottom: "28px", display: "inline-block" }}>{f.icon}</div>
                <h3 style={{ fontSize: "23px", fontWeight: "700", marginBottom: "16px", color: "#0f172a" }}>{f.title}</h3>
                <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "16px" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: IMPACT STATS - White Background */}
      <section id="stats-section" className="bg-white" style={{ padding: "100px 20px", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "60px" }}>
              <div className={statsInView ? "animate-stat" : ""} style={{ textAlign: "center", opacity: statsInView ? 1 : 0 }}>
                 <div style={{ fontSize: "60px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.04em" }}>
                    {loadingStats ? "..." : formatStat(stats.problemsTracked)}
                 </div>
                 <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Problems Tracked</div>
              </div>
              <div className={statsInView ? "animate-stat" : ""} style={{ textAlign: "center", opacity: statsInView ? 1 : 0, animationDelay: "0.1s" }}>
                 <div style={{ fontSize: "60px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.04em" }}>
                    {loadingStats ? "..." : formatStat(stats.activeUsers)}
                 </div>
                 <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Active Users</div>
              </div>
              <div className={statsInView ? "animate-stat" : ""} style={{ textAlign: "center", opacity: statsInView ? 1 : 0, animationDelay: "0.2s" }}>
                 <div style={{ fontSize: "60px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.04em" }}>
                    {loadingStats ? "..." : formatStat(stats.roadmapsCreated)}
                 </div>
                 <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Roadmaps Created</div>
              </div>
              <div className={statsInView ? "animate-stat" : ""} style={{ textAlign: "center", opacity: statsInView ? 1 : 0, animationDelay: "0.3s" }}>
                 <div style={{ fontSize: "60px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.04em" }}>
                    {loadingStats ? "..." : formatStat(stats.analysesCompleted)}
                 </div>
                 <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Analyses Completed</div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA - Dark Navy Background */}
      <section style={{ padding: "120px 20px", background: "#ffffff" }}>
        <div style={{ 
          maxWidth: "1160px", 
          margin: "0 auto", 
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)", 
          borderRadius: "44px", 
          padding: "110px 40px", 
          textAlign: "center",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.45)"
        }}>
           {/* Sophisticated Glow */}
           <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)", pointerEvents: "none" }}></div>
           
           <h2 style={{ fontSize: "clamp(38px, 6vw, 68px)", fontWeight: "800", marginBottom: "28px", letterSpacing: "-0.04em", position: "relative", color: "#ffffff", lineHeight: "1.1" }}>
             Start Your Placement<br />Journey Today.
           </h2>
           <p style={{ fontSize: "22px", opacity: 0.9, color: "#cbd5e1", marginBottom: "52px", maxWidth: "660px", margin: "0 auto 52px", position: "relative", lineHeight: "1.6" }}>
             Join the next generation of engineers mastering their preparation with PrepTracker. Start for free today.
           </p>
           <div style={{ position: "relative" }}>
             <Link to="/signup" className="btn-primary" style={{ background: "#ffffff", color: "#0f172a", padding: "22px 52px", fontSize: "22px", borderRadius: "18px", fontWeight: "700", boxShadow: "0 20px 40px -5px rgba(0,0,0,0.4)" }}>
               Start Preparing Now
             </Link>
           </div>
        </div>
      </section>

      {/* Footer - Soft Gray Background */}
      <footer className="bg-soft-gray" style={{ padding: "100px 20px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "28px" }}>
            <Logo size={32} />
            <span style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em" }}>PrepTracker</span>
         </div>
         <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "48px" }}>
            <span style={{ color: "#64748b", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>Product</span>
            <span style={{ color: "#64748b", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>Resources</span>
            <span style={{ color: "#64748b", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>Privacy</span>
            <span style={{ color: "#64748b", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>Terms</span>
         </div>
         <p style={{ color: "#94a3b8", fontSize: "14px", letterSpacing: "0.2px" }}>© 2026 PrepTracker AI Platform. Built for excellence.</p>
      </footer>
    </div>
  );
};

export default Landing;
