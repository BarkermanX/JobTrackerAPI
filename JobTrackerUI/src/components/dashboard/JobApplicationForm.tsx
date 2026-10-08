import { useState, type FormEvent } from "react";
import {
  createJobApplication,
  jobApplicationStatuses,
  type JobApplication,
  type JobApplicationStatus,
  type NewJobApplication,
} from "../../api/jobApplicationsApi";

interface JobApplicationFormProps {
  onSaved: (application: JobApplication) => void;
  onCancel: () => void;
}

function getLocalDateValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function JobApplicationForm({ onSaved, onCancel }: JobApplicationFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateApplied, setDateApplied] = useState(getLocalDateValue);
  const [status, setStatus] = useState<JobApplicationStatus>("Applied");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const application: NewJobApplication = {
      companyName,
      jobTitle,
      location,
      dateApplied,
      status,
    };

    try {
      const savedApplication = await createJobApplication(application);
      onSaved(savedApplication);
    } catch (saveError: unknown) {
      console.error("Unable to save job application:", saveError);
      setError(saveError instanceof Error
        ? saveError.message
        : "Unable to save this job application.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="job-application-form" onSubmit={handleSubmit}>
      <div className="job-application-form-grid">
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
        <label className="job-application-form-field">
          <span>Location <small>OPTIONAL</small></span>
          <input
            autoComplete="address-level2"
            maxLength={120}
            onChange={event => setLocation(event.target.value)}
            value={location}
          />
        </label>
        <label className="job-application-form-field">
          <span>Date applied</span>
          <input
            max={getLocalDateValue()}
            onChange={event => setDateApplied(event.target.value)}
            required
            type="date"
            value={dateApplied}
          />
        </label>
        <label className="job-application-form-field">
          <span>Status</span>
          <select
            onChange={event => setStatus(event.target.value as JobApplicationStatus)}
            value={status}
          >
            {jobApplicationStatuses.map(applicationStatus => (
              <option key={applicationStatus} value={applicationStatus}>
                {applicationStatus}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="job-application-form-error" role="alert">{error}</p>}
      <div className="job-application-form-actions">
        <button className="job-application-cancel-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="job-application-save-button" disabled={saving} type="submit">
          {saving ? "Adding…" : "Add application"}
        </button>
      </div>
    </form>
  );
}

export default JobApplicationForm;
