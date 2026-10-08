import type { ReactNode } from "react";

const sections = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "expectations", icon: "◎", label: "Job expectations" },
  { id: "personal-details", icon: "◉", label: "Personal details" },
  { id: "applied", icon: "↗", label: "Jobs applied for" },
  { id: "considering", icon: "", label: "Jobs considering" },
  { id: "portfolio", icon: "▤", label: "Portfolio notes" },
  { id: "follow-ups", icon: "◷", label: "Interviews & follow-ups" },
  { id: "job-search", icon: "⌕", label: "Job search results" },
];

interface DashboardLayoutProps {
  username: string;
  onLogout: () => void;
  children: ReactNode;
}

function DashboardLayout({ username, onLogout, children }: DashboardLayoutProps) {
  const initial = username.slice(0, 1).toUpperCase();

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="#overview" aria-label="Job Tracker home">
          <span className="dashboard-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <rect x="3.5" y="8" width="17" height="12" rx="2" />
              <path d="M8.5 8V6.5A1.5 1.5 0 0 1 10 5h4a1.5 1.5 0 0 1 1.5 1.5V8M3.5 12h17m-11 3 1.8 1.8L15.5 14" />
            </svg>
          </span>
          <span>Job Tracker</span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="dashboard-nav" aria-label="Dashboard sections">
          {sections.map((section, index) => (
            <a
              className={`dashboard-nav-link${index === 0 ? " is-active" : ""}`}
              href={`#${section.id}`}
              key={section.id}
            >
              <span className="nav-icon" aria-hidden="true">
                {section.id === "expectations" ? (
                  <svg className="expectations-icon" viewBox="0 0 24 24" focusable="false">
                    <path d="M12 2.75 14.4 4l2.7-.1 1.1 2.5 2.2 1.6-.7 2.6.7 2.6-2.2 1.6-1.1 2.5-2.7-.1-2.4 1.25L9.6 17l-2.7.1-1.1-2.5-2.2-1.6.7-2.6-.7-2.6 2.2-1.6 1.1-2.5 2.7.1z" />
                    <path d="m8.5 10.7 2.2 2.2 4.8-4.8" />
                  </svg>
                ) : section.id === "personal-details" ? (
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20z" />
                  </svg>
                ) : section.id === "considering" ? (
                  <svg className="saved-role-icon" viewBox="0 0 24 24" focusable="false">
                    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1z" />
                  </svg>
                ) : section.id === "portfolio" ? (
                  <svg className="notebook-icon" viewBox="0 0 24 24" focusable="false">
                    <path d="M6 3.5h13a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z" />
                    <path d="M6 3.5v17M3.5 7h5M3.5 12h5M3.5 17h5M10 8h6M10 12h6M10 16h6" />
                  </svg>
                ) : section.id === "follow-ups" ? (
                  <svg className="conversation-icon" viewBox="0 0 24 24" focusable="false">
                    <circle cx="8.5" cy="8" r="3" />
                    <circle cx="16.5" cy="9" r="2.5" />
                    <path d="M3.5 19v-1a5 5 0 0 1 10 0v1zM14 14a4.2 4.2 0 0 1 6.5 3.5v.5h-5" />
                  </svg>
                ) : section.icon}
              </span>
              <span>{section.label}</span>
            </a>
          ))}
        </nav>

      </aside>

      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-meta">
            <span className="demo-status"><span /> Demo project</span>
            <span className="topbar-divider" />
            <span className="topbar-avatar" aria-hidden="true">{initial}</span>
            <button className="topbar-logout" type="button" onClick={onLogout}>
              <span aria-hidden="true">↪</span>
              <span>Log out</span>
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {children}
          <footer className="dashboard-footer">
            <span>Job Tracker <span className="footer-dot">·</span> A clearer path to what’s next</span>
            <span>Features in progress</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
