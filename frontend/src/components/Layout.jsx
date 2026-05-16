import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="app-container">
      <Header />
      <main className={isLanding ? "landing-main" : "main-content"}>
        {children}
      </main>
      {!isLanding && <Footer />}
    </div>
  );
}

export default Layout;