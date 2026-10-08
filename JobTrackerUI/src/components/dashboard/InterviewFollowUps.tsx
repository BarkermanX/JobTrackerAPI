import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  deleteInterviewFollowUp,
  getInterviewFollowUps,
  type InterviewFollowUp,
} from "../../api/interviewFollowUpsApi";
import InterviewFollowUpForm from "./InterviewFollowUpForm";

interface InterviewFollowUpsProps {
  onUpcomingInterviewsChange: (count: number | null) => void;
}

function sortFollowUps(items: InterviewFollowUp[]): InterviewFollowUp[] {
  const now = Date.now();
  return [...items].sort((first, second) => {
    const firstTime = new Date(first.scheduledAt).getTime();
    const secondTime = new Date(second.scheduledAt).getTime();
    const firstPast = firstTime < now;
    const secondPast = secondTime < now;
    if (firstPast !== secondPast) return firstPast ? 1 : -1;
    return firstPast ? secondTime - firstTime : firstTime - secondTime;
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function InterviewFollowUps({ onUpcomingInterviewsChange }: InterviewFollowUpsProps) {
  const [items, setItems] = useState<InterviewFollowUp[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [editing, setEditing] = useState<InterviewFollowUp | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InterviewFollowUp | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    const controller = new AbortController();
    getInterviewFollowUps(controller.signal)
      .then(events => {
        if (controller.signal.aborted) return;
        setCurrentTime(Date.now());
        const sortedEvents = sortFollowUps(events);
        setItems(sortedEvents);
        onUpcomingInterviewsChange(sortedEvents.filter(event =>
          event.type === "Interview" && new Date(event.scheduledAt).getTime() >= Date.now(),
        ).length);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load interviews and follow-ups:", loadError);
        setError(loadError instanceof Error
          ? loadError.message
          : "Unable to load interviews and follow-ups.");
        onUpcomingInterviewsChange(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [onUpcomingInterviewsChange]);

  useEffect(() => () => {
    if (toastTimeout.current !== null) clearTimeout(toastTimeout.current);
  }, []);

  useEffect(() => {
    if (!pendingDelete) return;
    const followUpSection = section.current;
    cancelButton.current?.focus();
    return () => {
      if (deleteTrigger.current && document.body.contains(deleteTrigger.current)) {
        deleteTrigger.current.focus();
      } else {
        followUpSection?.focus();
      }
    };
  }, [pendingDelete]);

  function updateItems(nextItems: InterviewFollowUp[]) {
    const sortedItems = sortFollowUps(nextItems);
    setItems(sortedItems);
    onUpcomingInterviewsChange(sortedItems.filter(event =>
      event.type === "Interview" && new Date(event.scheduledAt).getTime() >= Date.now(),
    ).length);
  }

  function showToast(message: string) {
    if (toastTimeout.current !== null) clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => {
      setToast("");
      toastTimeout.current = null;
    }, 3000);
  }

  function handleSaved(saved: InterviewFollowUp) {
    updateItems(editing
      ? items.map(item => item.id === saved.id ? saved : item)
      : [...items, saved]);
    setEditing(null);
    setFormOpen(false);
    setError("");
    showToast(editing
      ? "Interview or follow-up updated successfully."
      : "Interview or follow-up added successfully.");
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteInterviewFollowUp(pendingDelete.id);
      updateItems(items.filter(item => item.id !== pendingDelete.id));
      setPendingDelete(null);
      showToast("Interview or follow-up deleted successfully.");
    } catch (deleteFailure: unknown) {
      console.error("Unable to delete interview or follow-up:", deleteFailure);
      setDeleteError(deleteFailure instanceof Error
        ? deleteFailure.message
        : "Unable to delete this event.");
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
      <article className="dashboard-card interview-follow-ups-card" id="follow-ups" ref={section} tabIndex={-1}>
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
          <div className="saved-jobs-heading-actions">
            <span className="section-count">{items.length} {items.length === 1 ? "event" : "events"}</span>
            {!formOpen && !editing && items.length > 3 && (
              <button
                aria-expanded={eventsExpanded}
                className="list-expand-button"
                onClick={() => setEventsExpanded(expanded => !expanded)}
                type="button"
              >
                {eventsExpanded ? "Show less" : "Show all"}
              </button>
            )}
            {!formOpen && !editing && (
              <button className="job-application-add-button" onClick={() => setFormOpen(true)} type="button">
                <span aria-hidden="true">+</span> Add event
              </button>
            )}
          </div>
        </div>

        {formOpen || editing ? (
          <InterviewFollowUpForm
            key={editing?.id ?? "new"}
            followUp={editing ?? undefined}
            onCancel={() => {
              setEditing(null);
              setFormOpen(false);
            }}
            onSaved={handleSaved}
          />
        ) : loading ? (
          <div className="compact-empty"><strong>Loading your calendar…</strong></div>
        ) : error ? (
          <p className="job-applications-error" role="alert">{error}</p>
        ) : items.length > 0 ? (
          <div className={`interview-follow-ups-list${eventsExpanded ? " is-expanded" : ""}`}>
            {items.map(item => {
              const isPast = currentTime !== null &&
                new Date(item.scheduledAt).getTime() < currentTime;
              return (
                <article className={`interview-follow-up-item${isPast ? " is-past" : ""}`} key={item.id}>
                  <div className="interview-follow-up-date" aria-hidden="true">
                    <strong>{new Date(item.scheduledAt).toLocaleDateString("en-GB", { day: "2-digit" })}</strong>
                    <span>{new Date(item.scheduledAt).toLocaleDateString("en-GB", { month: "short" })}</span>
                  </div>
                  <div className="interview-follow-up-details">
                    <div className="interview-follow-up-title">
                      <span className={`interview-follow-up-type ${item.type === "Interview" ? "is-interview" : "is-follow-up"}`}>
                        {item.type}
                      </span>
                      {isPast && <span className="interview-follow-up-past">Past</span>}
                      <time dateTime={item.scheduledAt}>{formatDateTime(item.scheduledAt)}</time>
                    </div>
                    <h3>{item.jobTitle}</h3>
                    <p>{item.companyName}</p>
                    {item.locationOrLink && (
                      item.locationOrLink.startsWith("https://") || item.locationOrLink.startsWith("http://")
                        ? <a href={item.locationOrLink} rel="noreferrer" target="_blank">Join / view location ↗</a>
                        : <span className="interview-follow-up-location">{item.locationOrLink}</span>
                    )}
                    {item.notes && <p className="interview-follow-up-notes">{item.notes}</p>}
                  </div>
                  <div className="interview-follow-up-actions">
                    <button
                      className="saved-job-edit-button"
                      disabled={deleting}
                      onClick={() => setEditing(item)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${item.type.toLowerCase()} for ${item.jobTitle} at ${item.companyName}`}
                      className="saved-job-delete-button"
                      disabled={deleting}
                      onClick={event => {
                        deleteTrigger.current = event.currentTarget;
                        setDeleteError("");
                        setPendingDelete(item);
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
            <span className="empty-icon empty-icon-small" aria-hidden="true">✓</span>
            <strong>Nothing on the calendar</strong>
            <p>Add an interview or follow-up to keep the next step in view.</p>
            <button className="job-application-empty-button" onClick={() => setFormOpen(true)} type="button">
              Add your first event
            </button>
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
            aria-describedby="interview-follow-up-delete-description"
            aria-labelledby="interview-follow-up-delete-title"
            aria-modal="true"
            className="application-delete-dialog"
            onKeyDown={handleDialogKeyDown}
            role="alertdialog"
          >
            <span className="application-delete-icon" aria-hidden="true">×</span>
            <h2 id="interview-follow-up-delete-title">Delete this calendar event?</h2>
            <p id="interview-follow-up-delete-description">
              Delete the {pendingDelete.type.toLowerCase()} for{" "}
              <strong>{pendingDelete.jobTitle}</strong> at <strong>{pendingDelete.companyName}</strong>?
              This can’t be undone.
            </p>
            {deleteError && <p className="application-delete-error" role="alert">{deleteError}</p>}
            <div className="application-delete-actions">
              <button disabled={deleting} onClick={() => setPendingDelete(null)} ref={cancelButton} type="button">
                Cancel
              </button>
              <button
                className="application-delete-confirm"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? "Deleting…" : "Delete event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InterviewFollowUps;
