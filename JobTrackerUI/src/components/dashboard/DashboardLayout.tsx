import type { ReactNode } from "react";

const sections = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "expectations", icon: "◎", label: "Job expectations" },
  { id: "personal-details", icon: "◉", label: "Personal details" },
  { id: "applied", icon: "↗", label: "Jobs applied for" },
  { id: "considering", icon: "◇", label: "Jobs considering" },
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
          <span className="dashboard-brand-mark" aria-hidden="true">J</span>
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
              <span className="nav-icon" aria-hidden="true">{section.icon}</span>
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
