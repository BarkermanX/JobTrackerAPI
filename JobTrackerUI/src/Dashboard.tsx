import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "./api";

interface Personnel {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);


  const handleLogout = async () => {
  try {
    await logout();

    navigate("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        const response = await apiFetch("/api/Personnel");

        if (!response.ok) {
          console.log("Failed to load personnel");
          return;
        }

        const data = await response.json();

        setPersonnel(data);
      } catch (error) {
        console.error("Error loading personnel:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPersonnel();
  }, []);

  return (
    <div>
      <h1>Job Tracker</h1>

      <h2>Dashboard</h2>

        <button type="button" onClick={handleLogout}>
            Logout
        </button>

        {loading ? (
            <p>Loading personnel...</p>
        ) : (
            <ul>
            {personnel.map((person) => (
                <li key={person.id}>
                {person.firstName} {person.lastName} — {person.email}
                </li>
            ))}
            </ul>
        )}
    </div>
  );
}

export default Dashboard;