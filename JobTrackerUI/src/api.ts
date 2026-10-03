let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/Auth/refresh", {
      method: "POST",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string" && input.startsWith("/")
      ? `${API_URL}${input}`
      : input;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    return response;
  }

  return fetch(url, {
    ...init,
    credentials: "include",
  });
}