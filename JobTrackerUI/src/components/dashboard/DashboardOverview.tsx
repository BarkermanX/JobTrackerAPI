import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import JobExpectationsForm from "../JobExpectationsForm";
import {
  getJobExpectations,
  type JobExpectations,
} from "../../api/jobExpectationsApi";
import PersonalDetailsForm from "../PersonalDetailsForm";
import {
  getPersonalDetails,
  type PersonalDetails,
} from "../../api/personalDetailsApi";
import {
  getJobApplications,
  jobApplicationStatuses,
  deleteJobApplication,
  updateJobApplicationStatus,
  type JobApplication,
  type JobApplicationStatus,
} from "../../api/jobApplicationsApi";
import JobApplicationForm from "./JobApplicationForm";
import JobsConsidering from "./JobsConsidering";

interface DashboardOverviewProps {
  username: string;
}

const applicationStatusOrder: Record<JobApplicationStatus, number> = {
  Applied: 0,
  Interview: 1,
  Offer: 2,
  Rejected: 3,
  Withdrawn: 4,
};

function sortApplications(applications: JobApplication[]): JobApplication[] {
  return [...applications].sort((first, second) =>
    applicationStatusOrder[first.status] - applicationStatusOrder[second.status] ||
    second.dateApplied.localeCompare(first.dateApplied) ||
    first.companyName.localeCompare(second.companyName));
}

function DashboardOverview({ username }: DashboardOverviewProps) {
  const applicationChangesDuringLoad = useRef(false);
  const applicationToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applicationSectionRef = useRef<HTMLElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");
  const [applicationToast, setApplicationToast] = useState("");
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [pendingDeleteApplication, setPendingDeleteApplication] = useState<JobApplication | null>(null);
  const [deleteApplicationError, setDeleteApplicationError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(null);
  const [deletingApplicationId, setDeletingApplicationId] = useState<number | null>(null);
  const [consideringCount, setConsideringCount] = useState<number | null>(null);
  const [expectations, setExpectations] = useState<JobExpectations | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [personalDetailsLoading, setPersonalDetailsLoading] = useState(true);
  const [personalDetailsError, setPersonalDetailsError] = useState("");
  const [expectationsLoading, setExpectationsLoading] = useState(true);
  const [expectationsError, setExpectationsError] = useState("");
  const [editingExpectations, setEditingExpectations] = useState(false);
  const [editingPersonalDetails, setEditingPersonalDetails] = useState(false);
  const [expectationsExpanded, setExpectationsExpanded] = useState(true);
  const [personalDetailsExpanded, setPersonalDetailsExpanded] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getJobExpectations(controller.signal)
      .then(setExpectations)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load dashboard job expectations:", error);
        setExpectationsError(error instanceof Error
          ? error.message
          : "Unable to load your job expectations.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setExpectationsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getJobApplications(controller.signal)
      .then(items => {
        if (!applicationChangesDuringLoad.current) {
          setApplications(sortApplications(items));
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || applicationChangesDuringLoad.current) return;
        console.error("Unable to load dashboard job applications:", error);
        setApplicationsError(error instanceof Error
          ? error.message
          : "Unable to load your job applications.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setApplicationsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getPersonalDetails(controller.signal)
      .then(setPersonalDetails)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load dashboard personal details:", error);
        setPersonalDetailsError(error instanceof Error
          ? error.message
          : "Unable to load your personal details.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setPersonalDetailsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const salaryRange = expectations
    ? `${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(expectations.minimumSalary)} – ${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(expectations.maximumSalary)}`
    : "";
  const hasSavedExpectations = expectations !== null && (
    expectations.jobTitles.length > 0 ||
    expectations.companyPreferences.length > 0 ||
    expectations.location.length > 0 ||
    expectations.maxCommuteMinutes !== 30 ||
    expectations.minimumSalary !== 50000 ||
    expectations.maximumSalary !== 60000 ||
    expectations.workArrangement !== "All"
  );
  const interviewCount = applications.filter(application => application.status === "Interview").length;
  const offerCount = applications.filter(application => application.status === "Offer").length;
  const handleConsideringCountChange = useCallback((count: number | null) => {
    setConsideringCount(count);
  }, []);

  useEffect(() => () => {
    if (applicationToastTimeout.current !== null) {
      clearTimeout(applicationToastTimeout.current);
    }
  }, []);

  useEffect(() => {
    if (!pendingDeleteApplication) return;

    const applicationSection = applicationSectionRef.current;
    cancelDeleteButtonRef.current?.focus();
    return () => {
      if (deleteTriggerRef.current && document.body.contains(deleteTriggerRef.current)) {
        deleteTriggerRef.current.focus();
      } else {
        applicationSection?.focus();
      }
    };
  }, [pendingDeleteApplication]);

  function showApplicationToast(message: string) {
    if (applicationToastTimeout.current !== null) {
      clearTimeout(applicationToastTimeout.current);
    }

    setApplicationToast(message);
    applicationToastTimeout.current = setTimeout(() => {
      setApplicationToast("");
      applicationToastTimeout.current = null;
    }, 3000);
  }

  async function handleApplicationStatusChange(id: number, status: JobApplicationStatus) {
    setUpdatingApplicationId(id);
    setApplicationsError("");
    setApplicationToast("");
    if (applicationToastTimeout.current !== null) {
      clearTimeout(applicationToastTimeout.current);
      applicationToastTimeout.current = null;
    }

    try {
      const updatedApplication = await updateJobApplicationStatus(id, status);
      setApplications(current => sortApplications(current.map(application =>
        application.id === id ? updatedApplication : application)));
      showApplicationToast("Application status saved successfully.");
    } catch (error: unknown) {
      console.error("Unable to update job application status:", error);
      setApplicationsError(error instanceof Error
        ? error.message
        : "Unable to update the application status.");
    } finally {
      setUpdatingApplicationId(null);
    }
  }

  async function handleApplicationDelete() {
    if (!pendingDeleteApplication) return;
    const application = pendingDeleteApplication;
    setDeletingApplicationId(application.id);
    setDeleteApplicationError("");

    try {
      await deleteJobApplication(application.id);
      setApplications(current => current.filter(item => item.id !== application.id));
      setPendingDeleteApplication(null);
      showApplicationToast("Job application deleted successfully.");
    } catch (error: unknown) {
      console.error("Unable to delete job application:", error);
      setDeleteApplicationError(error instanceof Error
        ? error.message
        : "Unable to delete this job application.");
    } finally {
      setDeletingApplicationId(null);
    }
  }

  function handleDeleteDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && deletingApplicationId === null) {
      event.preventDefault();
      setPendingDeleteApplication(null);
      return;
    }

    if (event.key !== "Tab") return;
    const focusableElements = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled)',
    );
    const firstElement = focusableElements.item(0);
    const lastElement = focusableElements.item(focusableElements.length - 1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  async function handleApplicationSaved(application: JobApplication) {
    applicationChangesDuringLoad.current = true;
    setApplications(current => sortApplications([...current, application]));
    setApplicationsLoading(false);
    setApplicationsError("");
    setApplicationFormOpen(false);

    try {
      const refreshedApplications = await getJobApplications();
      setApplications(sortApplications(refreshedApplications));
    } catch (error: unknown) {
      console.error("Unable to refresh job applications after saving:", error);
      setApplicationsError(error instanceof Error
        ? error.message
        : "The application was saved, but the list could not be refreshed.");
    }
  }

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
          <strong>{applicationsLoading ? "—" : applications.length}</strong>
          <span className="stat-caption">Your submitted applications</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-peach" aria-hidden="true">◇</span>
          <span className="stat-label">Roles considering</span>
          <strong>{consideringCount === null ? "—" : consideringCount}</strong>
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
            <b>{consideringCount ?? "—"}</b>
          </div>
          <span className="funnel-connector" aria-hidden="true">→</span>
          <div className="funnel-stage is-applied">
            <span className="funnel-stage-icon" aria-hidden="true">↗</span>
            <div><strong>Applied</strong><small>Applications sent</small></div>
            <b>{interviewCount}</b>
          </div>
          <span className="funnel-connector" aria-hidden="true">→</span>
          <div className="funnel-stage is-interview">
            <span className="funnel-stage-icon" aria-hidden="true">◷</span>
            <div><strong>Interview</strong><small>Conversations ahead</small></div>
            <b>{offerCount}</b>
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
        <article
          className={`dashboard-card${personalDetailsExpanded ? "" : " is-collapsed"}`}
          id="personal-details"
        >
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-blue" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20z" />
                </svg>
              </span>
              <div><h2>Personal details</h2><p>Your professional introduction</p></div>
            </div>
            <div className="card-heading-actions">
              <button
                className="expectations-edit-button"
                type="button"
                aria-expanded={editingPersonalDetails}
                aria-controls="personal-details-form"
                onClick={() => {
                  setPersonalDetailsExpanded(true);
                  setEditingPersonalDetails(editing => !editing);
                }}
              >
                {editingPersonalDetails ? "Hide form" : "Edit details"}
              </button>
              <button
                className="card-collapse-button"
                type="button"
                aria-expanded={personalDetailsExpanded}
                aria-controls="personal-details-content"
                aria-label={`${personalDetailsExpanded ? "Collapse" : "Expand"} personal details`}
                onClick={() => setPersonalDetailsExpanded(expanded => !expanded)}
              >
                <span aria-hidden="true">{personalDetailsExpanded ? "−" : "+"}</span>
              </button>
            </div>
          </div>
          {!personalDetailsExpanded && !personalDetailsLoading && !personalDetailsError && personalDetails && (
            <div className="personal-details-collapsed-summary" aria-label="Saved personal details">
              {personalDetails.fullName && <strong>{personalDetails.fullName}</strong>}
              {personalDetails.email && <span>{personalDetails.email}</span>}
              {personalDetails.phone && <span>{personalDetails.phone}</span>}
              {personalDetails.location && <span>{personalDetails.location}</span>}
              {personalDetails.professionalSummary && (
                <p>{personalDetails.professionalSummary}</p>
              )}
            </div>
          )}
          <div id="personal-details-content" hidden={!personalDetailsExpanded}>
            {editingPersonalDetails ? (
              <div id="personal-details-form" className="expectations-form-container">
                <PersonalDetailsForm
                  onSaved={details => {
                    setPersonalDetails(details);
                    setPersonalDetailsError("");
                    setEditingPersonalDetails(false);
                    setPersonalDetailsExpanded(false);
                  }}
                  onCancel={() => setEditingPersonalDetails(false)}
                />
              </div>
            ) : personalDetailsLoading ? (
              <p className="expectations-summary-message">Loading your personal details…</p>
            ) : personalDetailsError ? (
              <p className="expectations-summary-error" role="alert">{personalDetailsError}</p>
            ) : personalDetails && (
              personalDetails.fullName ||
              personalDetails.email ||
              personalDetails.phone ||
              personalDetails.location ||
              personalDetails.professionalSummary
            ) ? (
              <div className="personal-details-summary">
                <div className="personal-details-fields">
                  {personalDetails.fullName && (
                    <div><small>NAME</small><strong>{personalDetails.fullName}</strong></div>
                  )}
                  {personalDetails.email && (
                    <div><small>EMAIL</small><strong><a href={`mailto:${personalDetails.email}`}>{personalDetails.email}</a></strong></div>
                  )}
                  {personalDetails.phone && (
                    <div><small>PHONE</small><strong><a href={`tel:${personalDetails.phone}`}>{personalDetails.phone}</a></strong></div>
                  )}
                  {personalDetails.location && (
                    <div><small>LOCATION</small><strong>{personalDetails.location}</strong></div>
                  )}
                </div>
                {personalDetails.professionalSummary && (
                  <p className="personal-professional-summary">{personalDetails.professionalSummary}</p>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </article>

        <article
          className={`dashboard-card${expectationsExpanded ? "" : " is-collapsed"}`}
          id="expectations"
        >
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-lilac" aria-hidden="true">
                <svg className="expectations-icon" viewBox="0 0 24 24" focusable="false">
                  <path d="M12 2.75 14.4 4l2.7-.1 1.1 2.5 2.2 1.6-.7 2.6.7 2.6-2.2 1.6-1.1 2.5-2.7-.1-2.4 1.25L9.6 17l-2.7.1-1.1-2.5-2.2-1.6.7-2.6-.7-2.6 2.2-1.6 1.1-2.5 2.7.1z" />
                  <path d="m8.5 10.7 2.2 2.2 4.8-4.8" />
                </svg>
              </span>
              <div><h2>Job expectations</h2><p>What matters in your next role</p></div>
            </div>
            <div className="card-heading-actions">
              <button
                className="expectations-edit-button"
                type="button"
                aria-expanded={editingExpectations}
                aria-controls="job-expectations-form"
                onClick={() => {
                  setExpectationsExpanded(true);
                  setEditingExpectations(open => !open);
                }}
              >
                {editingExpectations ? "Hide form" : "Edit expectations"}
              </button>
              <button
                className="card-collapse-button"
                type="button"
                aria-expanded={expectationsExpanded}
                aria-controls="expectations-content"
                aria-label={`${expectationsExpanded ? "Collapse" : "Expand"} job expectations`}
                onClick={() => setExpectationsExpanded(expanded => !expanded)}
              >
                <span aria-hidden="true">{expectationsExpanded ? "−" : "+"}</span>
              </button>
            </div>
          </div>
          {!expectationsExpanded && !expectationsLoading && !expectationsError && hasSavedExpectations && expectations && (
            <div className="expectations-collapsed-summary" aria-label="Saved job expectations summary">
              {expectations.jobTitles.length > 0 && (
                <span><strong>Roles</strong>{expectations.jobTitles.join(", ")}</span>
              )}
              {expectations.location && (
                <span><strong>Location</strong>{expectations.location} · up to {expectations.maxCommuteMinutes} min commute</span>
              )}
              {(expectations.minimumSalary !== 50000 || expectations.maximumSalary !== 60000) && (
                <span><strong>Pay</strong>{salaryRange}</span>
              )}
              {expectations.companyPreferences.length > 0 && (
                <span><strong>Company</strong>{expectations.companyPreferences.join(", ")}</span>
              )}
              {expectations.workArrangement !== "All" && (
                <span><strong>Work arrangement</strong>{expectations.workArrangement}</span>
              )}
            </div>
          )}
          <div id="expectations-content" hidden={!expectationsExpanded}>
            {editingExpectations ? (
              <div id="job-expectations-form" className="expectations-form-container">
                <JobExpectationsForm
                  onSaved={savedExpectations => {
                    setExpectations(savedExpectations);
                    setExpectationsError("");
                    setEditingExpectations(false);
                    setExpectationsExpanded(false);
                  }}
                  onCancel={() => setEditingExpectations(false)}
                />
              </div>
            ) : (
              <>
                {expectationsLoading ? (
                  <p className="expectations-summary-message">Loading your saved expectations…</p>
                ) : expectationsError ? (
                  <p className="expectations-summary-error" role="alert">{expectationsError}</p>
                ) : expectations ? (
                  <div className="expectations-list">
                    <div className="expectation-item">
                      <span className="expectation-symbol" aria-hidden="true">⌕</span>
                      <span><small>POSITIONS & TITLES</small><strong>{expectations.jobTitles.length > 0 ? expectations.jobTitles.join(", ") : "Add the roles you’re looking for"}</strong></span>
                    </div>
                    <div className="expectation-item">
                      <span className="expectation-symbol" aria-hidden="true">⌖</span>
                      <span><small>LOCATION & COMMUTE</small><strong>{expectations.location || "Set your location"} · {expectations.maxCommuteMinutes} min commute</strong></span>
                    </div>
                    <div className="expectation-item">
                      <span className="expectation-symbol" aria-hidden="true">£</span>
                      <span><small>PAY & WORK STYLE</small><strong>{salaryRange} · {expectations.workArrangement}</strong></span>
                    </div>
                    <div className="expectation-item">
                      <span className="expectation-symbol" aria-hidden="true">✦</span>
                      <span><small>COMPANY PREFERENCES</small><strong>{expectations.companyPreferences.length > 0 ? expectations.companyPreferences.join(", ") : "Set company size, values or culture preferences"}</strong></span>
                    </div>
                  </div>
                ) : null}
                <p className="card-footnote">Use your preferences to keep the right opportunities in focus.</p>
              </>
            )}
          </div>
        </article>

      </section>

      <section
        className="dashboard-card pipeline-card"
        id="applied"
        ref={applicationSectionRef}
        tabIndex={-1}
      >
        <div className="card-heading">
          <div className="card-title-wrap">
            <span className="card-icon card-icon-purple" aria-hidden="true">↗</span>
            <div><h2>Jobs applied for</h2><p>Track each application from sent to decision</p></div>
          </div>
          <div className="application-heading-actions">
            <span className="section-count">{applications.length} {applications.length === 1 ? "application" : "applications"}</span>
            {!applicationFormOpen && (
              <button
                className="job-application-add-button"
                onClick={() => setApplicationFormOpen(true)}
                type="button"
              >
                <span aria-hidden="true">+</span> Add application
              </button>
            )}
          </div>
        </div>
        {applicationFormOpen ? (
          <JobApplicationForm
            onCancel={() => setApplicationFormOpen(false)}
            onSaved={handleApplicationSaved}
          />
        ) : (
          <>
            {applicationsError && (
              <p className="job-applications-error" role="alert">{applicationsError}</p>
            )}
            <div className="table-wrap">
              <div className="application-table application-table-header">
                <span>ROLE & COMPANY</span><span>LOCATION</span><span>DATE APPLIED</span><span>STATUS</span><span>ACTIONS</span>
              </div>
              {applicationsLoading ? (
                <div className="table-empty"><strong>Loading your applications…</strong></div>
              ) : applications.length > 0 ? (
                applications.map(application => (
                  <div className="application-table application-table-row" key={application.id}>
                    <span className="application-role">
                      <strong>{application.jobTitle}</strong>
                      <small>{application.companyName}</small>
                    </span>
                    <span className="application-location">{application.location || "—"}</span>
                    <time dateTime={application.dateApplied}>
                      {new Date(`${application.dateApplied}T00:00:00`).toLocaleDateString("en-GB")}
                    </time>
                    <label className="application-status-control">
                      <select
                        aria-label={`Status for ${application.jobTitle} at ${application.companyName}`}
                        disabled={updatingApplicationId !== null || deletingApplicationId !== null}
                        onChange={event => handleApplicationStatusChange(
                          application.id,
                          event.target.value as JobApplicationStatus,
                        )}
                        value={application.status}
                      >
                        {jobApplicationStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      aria-label={`Delete application for ${application.jobTitle} at ${application.companyName}`}
                      className="job-application-delete-button"
                      disabled={updatingApplicationId !== null || deletingApplicationId !== null}
                      onClick={event => {
                        deleteTriggerRef.current = event.currentTarget;
                        setDeleteApplicationError("");
                        setPendingDeleteApplication(application);
                      }}
                      type="button"
                    >
                      {deletingApplicationId === application.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="table-empty">
                  <span className="empty-icon" aria-hidden="true">↗</span>
                  <strong>Your applications will show up here</strong>
                  <p>Keep an eye on application dates and stages as you move through your search.</p>
                </div>
              )}
            </div>
          </>
        )}
        {applicationToast && (
          <div className="application-status-toast" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            {applicationToast}
          </div>
        )}
      </section>

      {pendingDeleteApplication && (
        <div
          className="application-delete-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget && deletingApplicationId === null) {
              setPendingDeleteApplication(null);
            }
          }}
        >
          <div
            aria-describedby="application-delete-description"
            aria-labelledby="application-delete-title"
            aria-modal="true"
            className="application-delete-dialog"
            onKeyDown={handleDeleteDialogKeyDown}
            role="alertdialog"
          >
            <span className="application-delete-icon" aria-hidden="true">×</span>
            <h2 id="application-delete-title">Delete this job application?</h2>
            <p id="application-delete-description">
              Are you sure you want to delete the application for{" "}
              <strong>{pendingDeleteApplication.jobTitle}</strong> at{" "}
              <strong>{pendingDeleteApplication.companyName}</strong>? This can’t be undone.
            </p>
            {deleteApplicationError && (
              <p className="application-delete-error" role="alert">{deleteApplicationError}</p>
            )}
            <div className="application-delete-actions">
              <button
                disabled={deletingApplicationId !== null}
                onClick={() => setPendingDeleteApplication(null)}
                ref={cancelDeleteButtonRef}
                type="button"
              >
                Cancel
              </button>
              <button
                className="application-delete-confirm"
                disabled={deletingApplicationId !== null}
                onClick={handleApplicationDelete}
                type="button"
              >
                {deletingApplicationId !== null ? "Deleting…" : "Delete application"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="dashboard-grid dashboard-grid-lower">
        <JobsConsidering onCountChange={handleConsideringCountChange} />

        <article className="dashboard-card" id="follow-ups">
          <div className="card-heading">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-blue" aria-hidden="true">
                <svg className="conversation-icon" viewBox="0 0 24 24" focusable="false">
                  <circle cx="8.5" cy="8" r="3" />
                  <circle cx="16.5" cy="9" r="2.5" />
                  <path d="M3.5 19v-1a5 5 0 0 1 10 0v1zM14 14a4.2 4.2 0 0 1 6.5 3.5v.5h-5" />
                </svg>
              </span>
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
              <span className="card-icon card-icon-green" aria-hidden="true">
                <svg className="notebook-icon" viewBox="0 0 24 24" focusable="false">
                  <path d="M6 3.5h13a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z" />
                  <path d="M6 3.5v17M3.5 7h5M3.5 12h5M3.5 17h5M10 8h6M10 12h6M10 16h6" />
                </svg>
              </span>
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
