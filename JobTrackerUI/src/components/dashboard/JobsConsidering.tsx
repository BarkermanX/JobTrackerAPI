import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { deleteSavedJob, getSavedJobs, type SavedJob } from "../../api/savedJobsApi";
import SavedJobForm from "./SavedJobForm";

interface JobsConsideringProps {
  onCountChange: (count: number | null) => void;
}

function getDaysUntilClosing(closingDate: string): number {
  const [year, month, day] = closingDate.split("-").map(Number);
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const closingUtc = Date.UTC(year, month - 1, day);
  return Math.round((closingUtc - todayUtc) / 86_400_000);
}

function getDeadline(savedJob: SavedJob): { className: string; label: string } | null {
  if (!savedJob.closingDate) return null;

  const daysRemaining = getDaysUntilClosing(savedJob.closingDate);
  if (daysRemaining < 0) {
    return { className: "is-closed", label: "Applications closed" };
  }

  if (daysRemaining === 0) {
    return { className: "is-closing-soon", label: "Closes today" };
  }

  if (daysRemaining <= 3) {
    return {
      className: "is-closing-soon",
      label: daysRemaining === 1 ? "Closes tomorrow" : `Closes in ${daysRemaining} days`,
    };
  }

  return null;
}

function sortSavedJobs(savedJobs: SavedJob[]): SavedJob[] {
  return [...savedJobs].sort((first, second) => {
    const firstDays = first.closingDate ? getDaysUntilClosing(first.closingDate) : null;
    const secondDays = second.closingDate ? getDaysUntilClosing(second.closingDate) : null;
    const urgency = (days: number | null) => {
      if (days !== null && days >= 0 && days <= 3) return 0;
      if (days !== null && days > 3) return 1;
      if (days === null) return 2;
      return 3;
    };

    const urgencyDifference = urgency(firstDays) - urgency(secondDays);
    if (urgencyDifference !== 0) return urgencyDifference;

    if (firstDays !== null && secondDays !== null) {
      return firstDays < 0
        ? secondDays - firstDays
        : firstDays - secondDays;
    }

    return first.companyName.localeCompare(second.companyName);
  });
}

function formatClosingDate(closingDate: string): string {
  const [year, month, day] = closingDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JobsConsidering({ onCountChange }: JobsConsideringProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [savedJobsExpanded, setSavedJobsExpanded] = useState(false);
  const [editingSavedJob, setEditingSavedJob] = useState<SavedJob | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedJob | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getSavedJobs(controller.signal)
      .then(jobs => {
        if (controller.signal.aborted) return;
        const sortedJobs = sortSavedJobs(jobs);
        setSavedJobs(sortedJobs);
        onCountChange(sortedJobs.length);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load considered jobs:", loadError);
        setError(loadError instanceof Error
          ? loadError.message
          : "Unable to load jobs you are considering.");
        onCountChange(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [onCountChange]);

  useEffect(() => () => {
    if (toastTimeout.current !== null) {
      clearTimeout(toastTimeout.current);
    }
  }, []);

  useEffect(() => {
    if (!pendingDelete) return;
    const savedJobsSection = section.current;
    cancelButton.current?.focus();

    return () => {
      if (deleteTrigger.current && document.body.contains(deleteTrigger.current)) {
        deleteTrigger.current.focus();
      } else {
        savedJobsSection?.focus();
      }
    };
  }, [pendingDelete]);

  function showToast(message: string) {
    if (toastTimeout.current !== null) clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => {
      setToast("");
      toastTimeout.current = null;
    }, 3000);
  }

  function handleSaved(savedJob: SavedJob) {
    const updatedJobs = sortSavedJobs(editingSavedJob
      ? savedJobs.map(job => job.id === savedJob.id ? savedJob : job)
      : [...savedJobs, savedJob]);
    setSavedJobs(updatedJobs);
    onCountChange(updatedJobs.length);
    setError("");
    setFormOpen(false);
    setEditingSavedJob(null);
    showToast(editingSavedJob
      ? "Job details updated successfully."
      : "Job saved to your roles to consider.");
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteSavedJob(pendingDelete.id);
      const updatedJobs = savedJobs.filter(job => job.id !== pendingDelete.id);
      setSavedJobs(updatedJobs);
      onCountChange(updatedJobs.length);
      setPendingDelete(null);
      showToast("Saved job deleted successfully.");
    } catch (deleteFailure: unknown) {
      console.error("Unable to delete considered job:", deleteFailure);
      setDeleteError(deleteFailure instanceof Error
        ? deleteFailure.message
        : "Unable to delete this saved job.");
    } finally {
      setDeleting(false);
    }
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !deleting) {
      event.preventDefault();
      setPendingDelete(null);
      return;
    }

    if (event.key !== "Tab") return;
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    const first = buttons.item(0);
    const last = buttons.item(buttons.length - 1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <article className="dashboard-card jobs-considering-card" id="considering" ref={section} tabIndex={-1}>
        <div className="card-heading">
          <div className="card-title-wrap">
            <span className="card-icon card-icon-peach" aria-hidden="true">
              <svg className="saved-role-icon" viewBox="0 0 24 24" focusable="false">
                <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1z" />
              </svg>
            </span>
            <div><h2>Jobs considering</h2><p>Keep interesting roles on your radar</p></div>
          </div>
          <div className="saved-jobs-heading-actions">
            <span className="section-count">{savedJobs.length} saved</span>
            {!formOpen && !editingSavedJob && savedJobs.length > 3 && (
              <button
                aria-expanded={savedJobsExpanded}
                className="list-expand-button"
                onClick={() => setSavedJobsExpanded(expanded => !expanded)}
                type="button"
              >
                {savedJobsExpanded ? "Show less" : "Show all"}
              </button>
            )}
            {!formOpen && (
              <button
                className="job-application-add-button"
                onClick={() => setFormOpen(true)}
                type="button"
              >
                <span aria-hidden="true">+</span> Add job
              </button>
            )}
          </div>
        </div>

        {formOpen || editingSavedJob ? (
          <SavedJobForm
            key={editingSavedJob?.id ?? "new"}
            savedJob={editingSavedJob ?? undefined}
            onCancel={() => {
              setFormOpen(false);
              setEditingSavedJob(null);
            }}
            onSaved={handleSaved}
          />
        ) : loading ? (
          <div className="compact-empty"><strong>Loading saved roles…</strong></div>
        ) : error ? (
          <p className="job-applications-error" role="alert">{error}</p>
        ) : savedJobs.length > 0 ? (
          <div className={`saved-jobs-list${savedJobsExpanded ? " is-expanded" : ""}`}>
            {savedJobs.map(savedJob => {
              const deadline = getDeadline(savedJob);
              return (
                <article className="saved-job-item" key={savedJob.id}>
                  <div className="saved-job-item-heading">
                    <div className="saved-job-title">
                      <h3>{savedJob.jobTitle}</h3>
                      <span>{savedJob.companyName}</span>
                    </div>
                    {deadline && (
                      <span className={`saved-job-deadline ${deadline.className}`}>
                        <span aria-hidden="true">{deadline.className === "is-closed" ? "!" : "◷"}</span>
                        {deadline.label}
                      </span>
                    )}
                  </div>
                  <div className="saved-job-meta">
                    {savedJob.salary && <span>{savedJob.salary}</span>}
                    {savedJob.location && <span>{savedJob.location}</span>}
                    {savedJob.closingDate && (
                      <span>Closes {formatClosingDate(savedJob.closingDate)}</span>
                    )}
                    {savedJob.jobUrl && (
                      <a href={savedJob.jobUrl} rel="noreferrer" target="_blank">
                        View job <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                  {savedJob.notes && <p className="saved-job-notes">{savedJob.notes}</p>}
                  <div className="saved-job-actions">
                    <button
                      aria-label={`Edit ${savedJob.jobTitle} at ${savedJob.companyName}`}
                      className="saved-job-edit-button"
                      disabled={deleting}
                      onClick={() => setEditingSavedJob(savedJob)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${savedJob.jobTitle} at ${savedJob.companyName}`}
                      className="saved-job-delete-button"
                      disabled={deleting}
                      onClick={event => {
                        deleteTrigger.current = event.currentTarget;
                        setDeleteError("");
                        setPendingDelete(savedJob);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="compact-empty">
            <span className="empty-icon empty-icon-small" aria-hidden="true">⌕</span>
            <strong>No roles saved yet</strong>
            <p>Keep promising openings here with their closing dates and notes.</p>            
          </div>
        )}
        {toast && (
          <div className="application-status-toast" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            {toast}
          </div>
        )}
      </article>

      {pendingDelete && (
        <div
          className="application-delete-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !deleting) setPendingDelete(null);
          }}
        >
          <div
            aria-describedby="saved-job-delete-description"
            aria-labelledby="saved-job-delete-title"
            aria-modal="true"
            className="application-delete-dialog"
            onKeyDown={handleDialogKeyDown}
            role="alertdialog"
          >
            <span className="application-delete-icon" aria-hidden="true">×</span>
            <h2 id="saved-job-delete-title">Remove this saved job?</h2>
            <p id="saved-job-delete-description">
              Delete <strong>{pendingDelete.jobTitle}</strong> at{" "}
              <strong>{pendingDelete.companyName}</strong> from your roles to consider? This can’t be undone.
            </p>
            {deleteError && (
              <p className="application-delete-error" role="alert">{deleteError}</p>
            )}
            <div className="application-delete-actions">
              <button
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
                ref={cancelButton}
                type="button"
              >
                Cancel
              </button>
              <button
                className="application-delete-confirm"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? "Deleting…" : "Delete saved job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JobsConsidering;
