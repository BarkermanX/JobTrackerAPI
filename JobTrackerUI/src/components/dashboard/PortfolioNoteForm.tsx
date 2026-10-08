import { useState, type FormEvent } from "react";
import {
  createPortfolioNote,
  portfolioNoteCategories,
  updatePortfolioNote,
  type PortfolioNote,
  type PortfolioNoteCategory,
  type PortfolioNoteInput,
} from "../../api/portfolioNotesApi";

interface PortfolioNoteFormProps {
  note?: PortfolioNote;
  onSaved: (note: PortfolioNote) => void;
  onCancel: () => void;
}

function PortfolioNoteForm({ note, onSaved, onCancel }: PortfolioNoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [category, setCategory] = useState<PortfolioNoteCategory>(note?.category ?? "Project win");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const input: PortfolioNoteInput = {
      title: title.trim(),
      content: content.trim(),
      category,
    };

    try {
      onSaved(note
        ? await updatePortfolioNote(note.id, input)
        : await createPortfolioNote(input));
    } catch (saveError: unknown) {
      console.error("Unable to save portfolio note:", saveError);
      setError(saveError instanceof Error
        ? saveError.message
        : `Unable to ${note ? "update" : "save"} this portfolio note.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="job-application-form portfolio-note-form" onSubmit={handleSubmit}>
      <div className="job-application-form-grid">
        <label className="job-application-form-field">
          <span>Category</span>
          <select
            onChange={event => setCategory(event.target.value as PortfolioNoteCategory)}
            value={category}
          >
            {portfolioNoteCategories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="job-application-form-field portfolio-note-form-wide">
          <span>Title</span>
          <input
            maxLength={120}
            onChange={event => setTitle(event.target.value)}
            required
            value={title}
          />
        </label>
        <label className="job-application-form-field portfolio-note-form-wide">
          <span>Note</span>
          <textarea
            maxLength={4000}
            onChange={event => setContent(event.target.value)}
            required
            rows={4}
            value={content}
          />
        </label>
      </div>
      {error && <p className="job-application-form-error" role="alert">{error}</p>}
      <div className="job-application-form-actions">
        <button className="job-application-cancel-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="job-application-save-button" disabled={saving} type="submit">
          {saving ? "Saving…" : note ? "Update note" : "Add note"}
        </button>
      </div>
    </form>
  );
}

export default PortfolioNoteForm;
