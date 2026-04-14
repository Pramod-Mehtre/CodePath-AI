import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddProblem from "./pages/AddProblem";
import Skills from "./pages/Skills";
import JDAnalyzer from "./pages/JDAnalyzer";
import CompanySheet from "./pages/CompanySheet";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

function AppWrapper() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add" 
            element={
              <ProtectedRoute>
                <AddProblem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/skills" 
            element={
              <ProtectedRoute>
                <Skills />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jd-analyzer" 
            element={
              <ProtectedRoute>
                <JDAnalyzer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company-sheet" 
            element={
              <ProtectedRoute>
                <CompanySheet />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  </ToastProvider>
);
}

export default AppWrapper;