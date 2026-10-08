import { apiFetch } from "../api";

export const portfolioNoteCategories = [
  "Project win",
  "Skills & strengths",
  "Questions to ask",
  "Other",
] as const;

export type PortfolioNoteCategory = (typeof portfolioNoteCategories)[number];

export interface PortfolioNote {
  id: number;
  title: string;
  content: string;
  category: PortfolioNoteCategory;
  updatedAtUtc: string;
}

export type PortfolioNoteInput = Omit<PortfolioNote, "id" | "updatedAtUtc">;

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

export async function getPortfolioNotes(signal?: AbortSignal): Promise<PortfolioNote[]> {
  const response = await apiFetch("/api/PortfolioNotes", { signal });
  if (!response.ok) throw await getError(response, "Failed to load portfolio notes.");
  return await response.json() as PortfolioNote[];
}

export async function createPortfolioNote(note: PortfolioNoteInput): Promise<PortfolioNote> {
  const response = await apiFetch("/api/PortfolioNotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw await getError(response, "Failed to add the portfolio note.");
  return await response.json() as PortfolioNote;
}

export async function updatePortfolioNote(
  id: number,
  note: PortfolioNoteInput,
): Promise<PortfolioNote> {
  const response = await apiFetch(`/api/PortfolioNotes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw await getError(response, "Failed to update the portfolio note.");
  return await response.json() as PortfolioNote;
}

export async function deletePortfolioNote(id: number): Promise<void> {
  const response = await apiFetch(`/api/PortfolioNotes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await getError(response, "Failed to delete the portfolio note.");
}
