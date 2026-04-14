import { useEffect, useState } from "react";

const Toast = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!document.getElementById("toast-animations")) {
      const style = document.createElement("style");
      style.id = "toast-animations";
      style.innerHTML = `
        @keyframes slideInRight {
          0% { transform: translateX(110%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        .toast-close-btn:hover {
          color: #f8fafc !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // match animation duration
  };

  const typeConfig = {
    success: { icon: "✔", color: "#10b981", shadow: "#10b98133" },
    error: { icon: "❌", color: "#ef4444", shadow: "#ef444433" },
    warning: { icon: "⚠", color: "#f59e0b", shadow: "#f59e0b33" },
    info: { icon: "ℹ", color: "#3b82f6", shadow: "#3b82f633" }
  };

  const config = typeConfig[type] || typeConfig.info;

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    minWidth: "300px",
    maxWidth: "380px",
    borderRadius: "14px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderLeft: `4px solid ${config.color}`,
    boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 15px ${config.shadow}`,
    animation: isClosing 
      ? "slideOutRight 0.3s ease-in forwards" 
      : "slideInRight 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.1) forwards",
    margin: "0",
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: config.color, fontSize: "16px", filter: `drop-shadow(0 0 5px ${config.shadow})` }}>
          {config.icon}
        </span>
        <span style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "500", letterSpacing: "0.2px", lineHeight: "1.4" }}>
          {message}
        </span>
      </div>
      <button 
        onClick={handleClose} 
        className="toast-close-btn"
        style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "14px",
          marginLeft: "15px",
          padding: "4px 8px",
          transition: "all 0.2s ease"
        }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
