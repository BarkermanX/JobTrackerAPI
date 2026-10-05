const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<boolean> | null = null;
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/Auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          return false;
        }

        const data = await response.json();

        accessToken = data.accessToken;

        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }


  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string" && input.startsWith("/")
      ? `${API_URL}${input}`
      : input;

  const headers = new Headers(init?.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    return response;
  }

  const retryHeaders = new Headers(init?.headers);

  if (accessToken) {
    retryHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...init,
    headers: retryHeaders,
    credentials: "include",
  });
}