import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: SubmitEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        console.log("Login failed");
        return;
      }

      console.log("Login successful");

      const authenticated = await login();

      if (authenticated) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Job Tracker</h1>
          <p>Sign in to manage your applications</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;