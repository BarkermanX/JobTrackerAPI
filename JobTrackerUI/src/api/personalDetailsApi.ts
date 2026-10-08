import { apiFetch } from "../api";

export interface PersonalDetails {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    professionalSummary: string;
}

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

export async function getPersonalDetails(signal?: AbortSignal): Promise<PersonalDetails> {
    const response = await apiFetch("/api/PersonalDetails", { signal });

    if (!response.ok) {
        throw await getError(response, "Failed to load personal details.");
    }

    return await response.json() as PersonalDetails;
}

export async function savePersonalDetails(details: PersonalDetails): Promise<PersonalDetails> {
    const response = await apiFetch("/api/PersonalDetails", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(details)
    });

    if (!response.ok) {
        throw await getError(response, "Failed to save personal details.");
    }

    return await response.json() as PersonalDetails;
}
