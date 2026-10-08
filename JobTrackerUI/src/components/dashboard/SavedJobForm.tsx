import { useState, type FormEvent } from "react";
import {
  createSavedJob,
  updateSavedJob,
  type NewSavedJob,
  type SavedJob,
} from "../../api/savedJobsApi";

interface SavedJobFormProps {
  savedJob?: SavedJob;
  onSaved: (savedJob: SavedJob) => void;
  onCancel: () => void;
}

function SavedJobForm({ savedJob: initialSavedJob, onSaved, onCancel }: SavedJobFormProps) {
  const [companyName, setCompanyName] = useState(initialSavedJob?.companyName ?? "");
  const [jobTitle, setJobTitle] = useState(initialSavedJob?.jobTitle ?? "");
  const [salary, setSalary] = useState(initialSavedJob?.salary ?? "");
  const [jobUrl, setJobUrl] = useState(initialSavedJob?.jobUrl ?? "");
  const [location, setLocation] = useState(initialSavedJob?.location ?? "");
  const [closingDate, setClosingDate] = useState(initialSavedJob?.closingDate ?? "");
  const [notes, setNotes] = useState(initialSavedJob?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const savedJob: NewSavedJob = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      salary: salary.trim(),
      jobUrl: jobUrl.trim(),
      location: location.trim(),
      closingDate: closingDate || null,
      notes: notes.trim(),
    };

    try {
      const saved = initialSavedJob
        ? await updateSavedJob(initialSavedJob.id, savedJob)
        : await createSavedJob(savedJob);
      onSaved(saved);
    } catch (saveError: unknown) {
      console.error("Unable to save considered job:", saveError);
      setError(saveError instanceof Error
        ? saveError.message
        : `Unable to ${initialSavedJob ? "update" : "save"} this job.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="job-application-form saved-job-form" onSubmit={handleSubmit}>
      <div className="job-application-form-grid">
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
          <span>Salary <small>OPTIONAL</small></span>
          <input
            maxLength={120}
            onChange={event => setSalary(event.target.value)}
            placeholder="e.g. £45,000–£55,000"
            value={salary}
          />
        </label>
        <label className="job-application-form-field">
          <span>Location <small>OPTIONAL</small></span>
          <input
            autoComplete="address-level2"
            maxLength={120}
            onChange={event => setLocation(event.target.value)}
            value={location}
          />
        </label>
        <label className="job-application-form-field saved-job-form-wide">
          <span>Job URL <small>OPTIONAL</small></span>
          <input
            autoComplete="url"
            maxLength={2048}
            onChange={event => setJobUrl(event.target.value)}
            placeholder="https://"
            type="url"
            value={jobUrl}
          />
        </label>
        <label className="job-application-form-field">
          <span>Application closing date <small>OPTIONAL</small></span>
          <input
            onChange={event => setClosingDate(event.target.value)}
            type="date"
            value={closingDate}
          />
        </label>
        <label className="job-application-form-field saved-job-form-wide">
          <span>Notes <small>OPTIONAL</small></span>
          <textarea
            maxLength={2000}
            onChange={event => setNotes(event.target.value)}
            placeholder="What interests you about this opportunity?"
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
          {saving ? "Saving…" : initialSavedJob ? "Update job" : "Save job"}
        </button>
      </div>
    </form>
  );
}

export default SavedJobForm;
