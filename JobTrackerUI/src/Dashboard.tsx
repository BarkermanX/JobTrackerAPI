import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AdzunaJobSearch from "./components/dashboard/AdzunaJobSearch";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <DashboardLayout username={user?.username || "there"} onLogout={handleLogout}>
      <DashboardOverview username={user?.username || "there"} />
      <AdzunaJobSearch />
    </DashboardLayout>
  );
}

export default Dashboard;
