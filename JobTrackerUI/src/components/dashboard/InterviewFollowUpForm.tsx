import { useState, type FormEvent } from "react";
import {
  createInterviewFollowUp,
  interviewFollowUpTypes,
  updateInterviewFollowUp,
  type InterviewFollowUp,
  type InterviewFollowUpType,
  type NewInterviewFollowUp,
} from "../../api/interviewFollowUpsApi";

interface InterviewFollowUpFormProps {
  followUp?: InterviewFollowUp;
  onSaved: (followUp: InterviewFollowUp) => void;
  onCancel: () => void;
}

function toLocalInputValue(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function InterviewFollowUpForm({
  followUp,
  onSaved,
  onCancel,
}: InterviewFollowUpFormProps) {
  const [companyName, setCompanyName] = useState(followUp?.companyName ?? "");
  const [jobTitle, setJobTitle] = useState(followUp?.jobTitle ?? "");
  const [type, setType] = useState<InterviewFollowUpType>(followUp?.type ?? "Interview");
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(followUp?.scheduledAt));
  const [locationOrLink, setLocationOrLink] = useState(followUp?.locationOrLink ?? "");
  const [notes, setNotes] = useState(followUp?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const request: NewInterviewFollowUp = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      type,
      scheduledAt: new Date(scheduledAt).toISOString(),
      locationOrLink: locationOrLink.trim(),
      notes: notes.trim(),
    };

    try {
      const saved = followUp
        ? await updateInterviewFollowUp(followUp.id, request)
        : await createInterviewFollowUp(request);
      onSaved(saved);
    } catch (saveError: unknown) {
      console.error("Unable to save interview or follow-up:", saveError);
      setError(saveError instanceof Error
        ? saveError.message
        : `Unable to ${followUp ? "update" : "save"} this event.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="job-application-form interview-follow-up-form" onSubmit={handleSubmit}>
      <div className="job-application-form-grid">
        <label className="job-application-form-field">
          <span>Event type</span>
          <select value={type} onChange={event => setType(event.target.value as InterviewFollowUpType)}>
            {interviewFollowUpTypes.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="job-application-form-field">
          <span>Date and time</span>
          <input
            onChange={event => setScheduledAt(event.target.value)}
            required
            type="datetime-local"
            value={scheduledAt}
          />
        </label>
        <label className="job-application-form-field">
          <span>Company</span>
          <input
            autoComplete="organization"
            maxLength={120}
            onChange={event => setCompanyName(event.target.value)}
            required
            value={companyName}
          />
        </label>
        <label className="job-application-form-field">
          <span>Job title</span>
          <input
            autoComplete="organization-title"
            maxLength={120}
            onChange={event => setJobTitle(event.target.value)}
            required
            value={jobTitle}
          />
        </label>
        <label className="job-application-form-field interview-follow-up-wide">
          <span>Location or meeting link <small>OPTIONAL</small></span>
          <input
            maxLength={300}
            onChange={event => setLocationOrLink(event.target.value)}
            placeholder="Office address or video call URL"
            value={locationOrLink}
          />
        </label>
        <label className="job-application-form-field interview-follow-up-wide">
          <span>Notes <small>OPTIONAL</small></span>
          <textarea
            maxLength={2000}
            onChange={event => setNotes(event.target.value)}
            placeholder="Preparation, questions, or follow-up details"
            rows={3}
            value={notes}
          />
        </label>
      </div>
      {error && <p className="job-application-form-error" role="alert">{error}</p>}
      <div className="job-application-form-actions">
        <button className="job-application-cancel-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="job-application-save-button" disabled={saving} type="submit">
          {saving ? "Saving…" : followUp ? "Update event" : "Add event"}
        </button>
      </div>
    </form>
  );
}

export default InterviewFollowUpForm;
