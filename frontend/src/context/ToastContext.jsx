import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  // Global event listener for Axios interceptor
  useEffect(() => {
    // Check pending cross-page toasts
    const pendingError = localStorage.getItem("toast_error");
    if (pendingError) {
      toast.error(pendingError);
      localStorage.removeItem("toast_error");
    }

    const handleGlobalError = (event) => {
      toast.error(event.detail);
    };
    window.addEventListener("api_error", handleGlobalError);
    return () => window.removeEventListener("api_error", handleGlobalError);
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const toastContainerStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 9999,
};
