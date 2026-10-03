import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./login.css";
import { apiFetch } from "./api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const handleLogin = async (event: SubmitEvent) => {
    event.preventDefault();

    try {
      const response = await apiFetch("/api/Auth/login", {
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
      <main className="login-shell">
        <section className="login-artwork" aria-label="Job Tracker">
          <div className="artwork-orbit artwork-orbit-one" />
          <div className="artwork-orbit artwork-orbit-two" />
          <div className="artwork-orbit artwork-orbit-three" />

          <div className="artwork-brand">
            <span className="brand-mark" aria-hidden="true">J</span>
            <span>Job Tracker</span>
          </div>

          <div className="artwork-copy">
            <span className="artwork-eyebrow">YOUR NEXT CHAPTER</span>
            <h2>Make your next move count.</h2>
            <p>Keep every opportunity in view and make your job search feel a little more focused.</p>
          </div>
          <span className="artwork-caption">A clearer path to what’s next.</span>
        </section>

        <section className="login-panel">
          <div className="login-content">
            <div className="login-header">
              <span className="login-kicker">YOUR WORKSPACE</span>
              <h1>Welcome back</h1>
              <p>Pick up where you left off with your job search.</p>
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
                <span>Sign in</span>
                <span className="button-arrow" aria-hidden="true">→</span>
              </button>
            </form>

            <aside className={`project-note${showProjectDetails ? " is-expanded" : ""}`}>
              <button
                type="button"
                className="project-note-toggle"
                aria-expanded={showProjectDetails}
                aria-controls="project-note-details"
                onClick={() => setShowProjectDetails((expanded) => !expanded)}
              >
                <span className="project-note-icon" aria-hidden="true">i</span>
                <span className="project-note-label">
                  <strong>Demo project notes...</strong>
                  <span>{showProjectDetails ? "Click to show less" : "Click to learn more"}</span>
                </span>
                <span className="project-note-chevron" aria-hidden="true">⌄</span>
              </button>
              <div
                className="project-note-details"
                id="project-note-details"
                hidden={!showProjectDetails}
              >
                <p>This is a demo project hosted on Azure. It runs on the free tier, so cold starts or slower performance may occasionally occur.</p>
                <p>Authentication uses JWT tokens with blacklisting in place. Other areas include placeholders for functionality planned for the future.</p>
              </div>
            </aside>

            <p className="login-footer">Your next opportunity starts here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;