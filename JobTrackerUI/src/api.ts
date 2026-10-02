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

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    return response;
  }

  return fetch(input, init);
}