interface DashboardOverviewProps {
  username: string;
}

function DashboardOverview({ username }: DashboardOverviewProps) {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <section className="dashboard-hero">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-eyebrow"><span /> YOUR JOB SEARCH, IN ONE PLACE</p>
          <h1>Make your next<br />move count.</h1>
          <p className="hero-description">{timeOfDay}, {username}. Track applications, stay on top of follow-ups, and find your next opportunity.</p>
          <a className="hero-action" href="#job-search">Explore job matches <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-progress">
          <div className="hero-progress-top">
            <span className="hero-progress-icon" aria-hidden="true">↗</span>
            <span className="hero-demo-badge"><span /> DEMO PREVIEW</span>
          </div>
          <p className="hero-progress-label">YOUR SEARCH PIPELINE</p>
          <strong className="hero-progress-value">Ready when you are<span>.</span></strong>
          <div className="hero-progress-track" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="hero-progress-stages">
            <span>Discover</span><span>Apply</span><span>Interview</span><span>Land it</span>
          </div>
          <p className="hero-progress-note">A clearer view of every step, from first search to offer.</p>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Your job search at a glance">
        <article className="stat-card">
          <span className="stat-icon stat-icon-purple" aria-hidden="true">↗</span>
          <span className="stat-label">Applications sent</span>
          <strong>0</strong>
          <span className="stat-caption">Your submitted applications</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-peach" aria-hidden="true">◇</span>
          <span className="stat-label">Roles considering</span>
          <strong>0</strong>
          <span className="stat-caption">Opportunities on your radar</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-blue" aria-hidden="true">◷</span>
          <span className="stat-label">Interviews</span>
          <strong>0</strong>
          <span className="stat-caption">Upcoming conversations</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-green" aria-hidden="true">▤</span>
          <span className="stat-label">Portfolio notes</span>
          <strong>0</strong>
          <span className="stat-caption">Ideas and achievements saved</span>
        </article>
      </section>

      <section className="dashboard-card application-funnel" aria-labelledby="funnel-title">
        <div className="funnel-heading">
          <div>
            <p className="section-kicker">THE JOURNEY</p>
            <h2 id="funnel-title">Your application pipeline</h2>
            <p>Move opportunities forward, one step at a time.</p>
          </div>
          <span className="funnel-demo-label"><span /> PREVIEW</span>
        </div>
        <div className="funnel-stages">
          <div className="funnel-stage is-first">
            <span className="funnel-stage-icon" aria-hidden="true">◇</span>
            <div><strong>Considering</strong><small>Roles on your radar</small></div>
            <b>0</b>
          </div>
          <span className="funnel-connector" aria-hidden="true">→</span>
          <div className="funnel-stage is-applied">
            <span className="funnel-stage-icon" aria-hidden="true">↗</span>
            <div><strong>Applied</strong><small>Applications sent</small></div>
            <b>0</b>
          </div>
          <span className="funnel-connector" aria-hidden="true">→</span>
          <div className="funnel-stage is-interview">
            <span className="funnel-stage-icon" aria-hidden="true">◷</span>
            <div><strong>Interview</strong><small>Conversations ahead</small></div>
            <b>0</b>
          </div>
          <span className="funnel-connector" aria-hidden="true">→</span>
          <div className="funnel-stage is-offer">
            <span className="funnel-stage-icon" aria-hidden="true">✦</span>
            <div><strong>Offer</strong><small>New beginnings</small></div>
            <b>0</b>
          </div>
        </div>
        <div className="funnel-empty-note"><span aria-hidden="true">✦</span> Your pipeline will take shape as you add roles to your search.</div>
      </section>

      <section className="dashboard-grid dashboard-grid-overview">
        <article className="dashboard-card" id="expectations">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-lilac" aria-hidden="true">◎</span>
              <div><h2>Job expectations</h2><p>What matters in your next role</p></div>
            </div>
            <span className="coming-soon">PROFILE</span>
          </div>
          <div className="expectations-list">
            <div className="expectation-item">
              <span className="expectation-symbol" aria-hidden="true">⌕</span>
              <span><small>POSITIONS & TITLES</small><strong>Add the roles you’re looking for</strong></span>
            </div>
            <div className="expectation-item">
              <span className="expectation-symbol" aria-hidden="true">⌖</span>
              <span><small>LOCATION & COMMUTE</small><strong>Set your location and travel time</strong></span>
            </div>
            <div className="expectation-item">
              <span className="expectation-symbol" aria-hidden="true">£</span>
              <span><small>PAY & WORK STYLE</small><strong>Salary range, company size and values</strong></span>
            </div>
          </div>
          <p className="card-footnote">Use your preferences to keep the right opportunities in focus.</p>
        </article>

        <article className="dashboard-card" id="personal-details">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-blue" aria-hidden="true">◉</span>
              <div><h2>Personal details</h2><p>Your professional introduction</p></div>
            </div>
            <span className="coming-soon">PROFILE</span>
          </div>
          <div className="profile-empty">
            <span className="profile-placeholder" aria-hidden="true">+</span>
            <div>
              <strong>Make it yours</strong>
              <p>Add your contact details, preferred name and a short professional summary.</p>
            </div>
          </div>
          <div className="profile-details-hint">
            <span>CONTACT</span><span>LOCATION</span><span>ABOUT YOU</span>
          </div>
        </article>
      </section>

      <section className="dashboard-card pipeline-card" id="applied">
        <div className="card-heading">
          <div className="card-title-wrap">
            <span className="card-icon card-icon-purple" aria-hidden="true">↗</span>
            <div><h2>Jobs applied for</h2><p>Track each application from sent to decision</p></div>
          </div>
          <span className="section-count">0 applications</span>
        </div>
        <div className="table-wrap">
          <div className="application-table application-table-header">
            <span>ROLE & COMPANY</span><span>LOCATION</span><span>DATE APPLIED</span><span>STATUS</span><span>NEXT STEP</span>
          </div>
          <div className="table-empty">
            <span className="empty-icon" aria-hidden="true">↗</span>
            <strong>Your applications will show up here</strong>
            <p>Keep an eye on application dates, stages and what to follow up on.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid-lower">
        <article className="dashboard-card" id="considering">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-peach" aria-hidden="true">◇</span>
              <div><h2>Jobs considering</h2><p>Interesting roles to explore</p></div>
            </div>
            <span className="section-count">0 saved</span>
          </div>
          <div className="compact-empty">
            <span className="empty-icon empty-icon-small" aria-hidden="true">⌕</span>
            <strong>No roles saved yet</strong>
            <p>Keep promising openings here while you decide if they’re a good fit.</p>
          </div>
        </article>

        <article className="dashboard-card" id="follow-ups">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-blue" aria-hidden="true">◷</span>
              <div><h2>Interviews & follow-ups</h2><p>Stay ready for your next conversation</p></div>
            </div>
            <span className="coming-soon">PLANNER</span>
          </div>
          <div className="compact-empty">
            <span className="empty-icon empty-icon-small" aria-hidden="true">✓</span>
            <strong>Nothing on the calendar</strong>
            <p>Interview dates, reminders and follow-up notes will be easy to find here.</p>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-lower">
        <article className="dashboard-card portfolio-card" id="portfolio">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-green" aria-hidden="true">▤</span>
              <div><h2>Portfolio notes</h2><p>Collect the details you’ll want to remember</p></div>
            </div>
            <span className="coming-soon">NOTES</span>
          </div>
          <div className="portfolio-prompts">
            <span><i aria-hidden="true" />Project wins</span>
            <span><i aria-hidden="true" />Skills & strengths</span>
            <span><i aria-hidden="true" />Questions to ask</span>
          </div>
          <p className="portfolio-empty">Your achievements and interview prep notes will live here.</p>
        </article>

        <article className="dashboard-card search-plan-card">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-yellow" aria-hidden="true">✦</span>
              <div><h2>More for your search</h2><p>A few useful additions to your toolkit</p></div>
            </div>
          </div>
          <div className="search-plan-list">
            <div><span aria-hidden="true">01</span><p><strong>Search checklist</strong><small>Plan the small steps that keep momentum up</small></p><b aria-hidden="true">→</b></div>
            <div><span aria-hidden="true">02</span><p><strong>CV & cover letters</strong><small>Keep tailored application materials together</small></p><b aria-hidden="true">→</b></div>
            <div><span aria-hidden="true">03</span><p><strong>Networking notes</strong><small>Remember conversations and useful contacts</small></p><b aria-hidden="true">→</b></div>
          </div>
        </article>
      </section>

    </>
  );
}

export default DashboardOverview;
