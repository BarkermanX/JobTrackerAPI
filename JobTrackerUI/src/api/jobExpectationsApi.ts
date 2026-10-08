import { apiFetch } from "../api";

export interface JobExpectations {
    jobTitles: string[];
    companyPreferences: string[];
    location: string;
    maxCommuteMinutes: number;
    minimumSalary: number;
    maximumSalary: number;
    workArrangement: "On-site" | "Remote" | "Hybrid" | "All";
}

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

export async function getJobExpectations(signal?: AbortSignal): Promise<JobExpectations> {
    const response = await apiFetch("/api/JobExpectations", { signal });

    if (!response.ok) {
        throw await getError(response, "Failed to load job expectations.");
    }

    return await response.json() as JobExpectations;
}

export async function saveJobExpectations(expectations: JobExpectations): Promise<JobExpectations> {
    const response = await apiFetch("/api/JobExpectations", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expectations)
    });

    if (!response.ok) {
        throw await getError(response, "Failed to save job expectations.");
    }

    return await response.json() as JobExpectations;
}