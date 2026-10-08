import { apiFetch } from "../api";

export const interviewFollowUpTypes = ["Interview", "Follow-up"] as const;
export type InterviewFollowUpType = (typeof interviewFollowUpTypes)[number];

export interface InterviewFollowUp {
  id: number;
  companyName: string;
  jobTitle: string;
  type: InterviewFollowUpType;
  scheduledAt: string;
  locationOrLink: string;
  notes: string;
}

export type NewInterviewFollowUp = Omit<InterviewFollowUp, "id">;

async function getError(response: Response, fallback: string): Promise<Error> {
  const body = await response.text();
  if (!body) return new Error(fallback);

  try {
    const problem = JSON.parse(body) as { detail?: string; title?: string };
    return new Error(problem.detail || problem.title || fallback);
  } catch {
    return new Error(body);
  }
}

export async function getInterviewFollowUps(signal?: AbortSignal): Promise<InterviewFollowUp[]> {
  const response = await apiFetch("/api/InterviewFollowUps", { signal });
  if (!response.ok) {
    throw await getError(response, "Failed to load interviews and follow-ups.");
  }
  return await response.json() as InterviewFollowUp[];
}

export async function createInterviewFollowUp(
  followUp: NewInterviewFollowUp,
): Promise<InterviewFollowUp> {
  const response = await apiFetch("/api/InterviewFollowUps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(followUp),
  });
  if (!response.ok) {
    throw await getError(response, "Failed to add the calendar event.");
  }
  return await response.json() as InterviewFollowUp;
}

export async function updateInterviewFollowUp(
  id: number,
  followUp: NewInterviewFollowUp,
): Promise<InterviewFollowUp> {
  const response = await apiFetch(`/api/InterviewFollowUps/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(followUp),
  });
  if (!response.ok) {
    throw await getError(response, "Failed to update the calendar event.");
  }
  return await response.json() as InterviewFollowUp;
}

export async function deleteInterviewFollowUp(id: number): Promise<void> {
  const response = await apiFetch(`/api/InterviewFollowUps/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await getError(response, "Failed to delete the calendar event.");
  }
}
