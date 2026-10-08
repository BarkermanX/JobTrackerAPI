import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  deletePortfolioNote,
  getPortfolioNotes,
  type PortfolioNote,
} from "../../api/portfolioNotesApi";
import PortfolioNoteForm from "./PortfolioNoteForm";

interface PortfolioNotesProps {
  onCountChange: (count: number | null) => void;
}

function sortNotes(notes: PortfolioNote[]): PortfolioNote[] {
  return [...notes].sort((first, second) =>
    second.updatedAtUtc.localeCompare(first.updatedAtUtc));
}

function PortfolioNotes({ onCountChange }: PortfolioNotesProps) {
  const [notes, setNotes] = useState<PortfolioNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioNote | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PortfolioNote | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPortfolioNotes(controller.signal)
      .then(savedNotes => {
        if (!controller.signal.aborted) {
          setNotes(sortNotes(savedNotes));
          onCountChange(savedNotes.length);
        }
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load portfolio notes:", loadError);
        setError(loadError instanceof Error
          ? loadError.message
          : "Unable to load portfolio notes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [onCountChange]);

  useEffect(() => () => {
    if (toastTimeout.current !== null) clearTimeout(toastTimeout.current);
  }, []);

  useEffect(() => {
    if (!pendingDelete) return;
    const portfolioSection = section.current;
    cancelButton.current?.focus();
    return () => {
      if (deleteTrigger.current && document.body.contains(deleteTrigger.current)) {
        deleteTrigger.current.focus();
      } else {
        portfolioSection?.focus();
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

  function handleSaved(savedNote: PortfolioNote) {
    setNotes(sortNotes(editing
      ? notes.map(note => note.id === savedNote.id ? savedNote : note)
      : [...notes, savedNote]));
    onCountChange(editing ? notes.length : notes.length + 1);
    setFormOpen(false);
    setEditing(null);
    setError("");
    showToast(editing ? "Portfolio note updated successfully." : "Portfolio note added successfully.");
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePortfolioNote(pendingDelete.id);
      setNotes(current => current.filter(note => note.id !== pendingDelete.id));
      onCountChange(notes.length - 1);
      setPendingDelete(null);
      showToast("Portfolio note deleted successfully.");
    } catch (deleteFailure: unknown) {
      console.error("Unable to delete portfolio note:", deleteFailure);
      setDeleteError(deleteFailure instanceof Error
        ? deleteFailure.message
        : "Unable to delete this portfolio note.");
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

  const visibleNotes = expanded ? notes : notes.slice(0, 3);

  return (
    <>
      <article className="dashboard-card portfolio-card" id="portfolio" ref={section} tabIndex={-1}>
        <div className="card-heading">
          <div className="card-title-wrap">
            <span className="card-icon card-icon-green" aria-hidden="true">
              <svg className="notebook-icon" viewBox="0 0 24 24" focusable="false">
                <path d="M6 3.5h13a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z" />
                <path d="M6 3.5v17M3.5 7h5M3.5 12h5M3.5 17h5M10 8h6M10 12h6M10 16h6" />
              </svg>
            </span>
            <div><h2>Portfolio notes</h2><p>Collect achievements, strengths, and ideas</p></div>
          </div>
          <div className="saved-jobs-heading-actions">
            <span className="section-count">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
            {!formOpen && !editing && notes.length > 3 && (
              <button
                aria-expanded={expanded}
                className="list-expand-button"
                onClick={() => setExpanded(value => !value)}
                type="button"
              >
                {expanded ? "Show less" : "Show all"}
              </button>
            )}
            {!formOpen && !editing && (
              <button className="job-application-add-button" onClick={() => setFormOpen(true)} type="button">
                <span aria-hidden="true">+</span> Add note
              </button>
            )}
          </div>
        </div>

        {formOpen || editing ? (
          <PortfolioNoteForm
            key={editing?.id ?? "new"}
            note={editing ?? undefined}
            onCancel={() => {
              setEditing(null);
              setFormOpen(false);
            }}
            onSaved={handleSaved}
          />
        ) : loading ? (
          <div className="compact-empty"><strong>Loading portfolio notes…</strong></div>
        ) : error ? (
          <p className="job-applications-error" role="alert">{error}</p>
        ) : notes.length > 0 ? (
          <div className={`portfolio-notes-list${expanded ? " is-expanded" : ""}`}>
            {visibleNotes.map(note => (
              <article className="portfolio-note-item" key={note.id}>
                <div className="portfolio-note-heading">
                  <span className="portfolio-note-category">{note.category}</span>
                  <time dateTime={note.updatedAtUtc}>
                    Updated {new Date(note.updatedAtUtc).toLocaleDateString("en-GB")}
                  </time>
                </div>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="saved-job-actions">
                  <button
                    aria-label={`Edit note: ${note.title}`}
                    className="saved-job-edit-button"
                    disabled={deleting}
                    onClick={() => setEditing(note)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete note: ${note.title}`}
                    className="saved-job-delete-button"
                    disabled={deleting}
                    onClick={event => {
                      deleteTrigger.current = event.currentTarget;
                      setDeleteError("");
                      setPendingDelete(note);
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="compact-empty">
            <span className="empty-icon empty-icon-small" aria-hidden="true">▤</span>
            <strong>No portfolio notes yet</strong>
            <p>Save project wins, strengths, or questions you want to remember.</p>
            <div className="portfolio-prompts">
              <span><i aria-hidden="true" />Project wins</span>
              <span><i aria-hidden="true" />Skills & strengths</span>
              <span><i aria-hidden="true" />Questions to ask</span>
            </div>
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
            aria-describedby="portfolio-note-delete-description"
            aria-labelledby="portfolio-note-delete-title"
            aria-modal="true"
            className="application-delete-dialog"
            onKeyDown={handleDialogKeyDown}
            role="alertdialog"
          >
            <span className="application-delete-icon" aria-hidden="true">×</span>
            <h2 id="portfolio-note-delete-title">Delete this portfolio note?</h2>
            <p id="portfolio-note-delete-description">
              Delete <strong>{pendingDelete.title}</strong>? This can’t be undone.
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
                {deleting ? "Deleting…" : "Delete note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PortfolioNotes;
