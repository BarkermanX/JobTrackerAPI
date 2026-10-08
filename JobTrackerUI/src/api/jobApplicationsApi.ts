import { apiFetch } from "../api";

export const jobApplicationStatuses = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type JobApplicationStatus = (typeof jobApplicationStatuses)[number];

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  location: string;
  dateApplied: string;
  status: JobApplicationStatus;
}

export type NewJobApplication = Omit<JobApplication, "id">;

async function getError(response: Response, fallback: string): Promise<Error> {
  const body = await response.text();

  if (!body) {
    return new Error(fallback);
  }

  try {
    const problem = JSON.parse(body) as { detail?: string; title?: string };
    return new Error(problem.detail || problem.title || fallback);
  } catch {
    return new Error(body);
  }
}

export async function getJobApplications(signal?: AbortSignal): Promise<JobApplication[]> {
  const response = await apiFetch("/api/JobApplications", { signal });

  if (!response.ok) {
    throw await getError(response, "Failed to load your job applications.");
  }

  return await response.json() as JobApplication[];
}

export async function createJobApplication(
  application: NewJobApplication,
): Promise<JobApplication> {
  const response = await apiFetch("/api/JobApplications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    throw await getError(response, "Failed to add the job application.");
  }

  return await response.json() as JobApplication;
}

export async function updateJobApplicationStatus(
  id: number,
  status: JobApplicationStatus,
): Promise<JobApplication> {
  const response = await apiFetch(`/api/JobApplications/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw await getError(response, "Failed to update the application status.");
  }

  return await response.json() as JobApplication;
}

export async function deleteJobApplication(id: number): Promise<void> {
  const response = await apiFetch(`/api/JobApplications/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getError(response, "Failed to delete the job application.");
  }
}
