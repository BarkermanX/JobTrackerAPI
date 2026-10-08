import { apiFetch } from "../api";

export interface SavedJob {
  id: number;
  companyName: string;
  jobTitle: string;
  salary: string;
  jobUrl: string;
  location: string;
  closingDate: string | null;
  notes: string;
}

export type NewSavedJob = Omit<SavedJob, "id">;

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

export async function getSavedJobs(signal?: AbortSignal): Promise<SavedJob[]> {
  const response = await apiFetch("/api/SavedJobs", { signal });

  if (!response.ok) {
    throw await getError(response, "Failed to load jobs you are considering.");
  }

  return await response.json() as SavedJob[];
}

export async function createSavedJob(savedJob: NewSavedJob): Promise<SavedJob> {
  const response = await apiFetch("/api/SavedJobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savedJob),
  });

  if (!response.ok) {
    throw await getError(response, "Failed to save this job.");
  }

  return await response.json() as SavedJob;
}

export async function updateSavedJob(
  id: number,
  savedJob: NewSavedJob,
): Promise<SavedJob> {
  const response = await apiFetch(`/api/SavedJobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savedJob),
  });

  if (!response.ok) {
    throw await getError(response, "Failed to update the saved job.");
  }

  return await response.json() as SavedJob;
}

export async function deleteSavedJob(id: number): Promise<void> {
  const response = await apiFetch(`/api/SavedJobs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getError(response, "Failed to delete the saved job.");
  }
}
