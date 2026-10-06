import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch, setAccessToken } from "./api";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, onApiWaking?: () => void) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOGIN_RETRY_WINDOW_MS = 3 * 60 * 1000;
const LOGIN_RETRY_DELAY_MS = 5000;
const LOGIN_REQUEST_TIMEOUT_MS = 120000;

function isTransientApiFailure(error: unknown): boolean {
  return error instanceof TypeError ||
    (error instanceof DOMException && error.name === "AbortError");
}

async function requestWhileApiWakes(
  path: string,
  init: RequestInit,
  onApiWaking?: () => void,
): Promise<Response> {
  const startedAt = Date.now();
  let hasReportedWakeUp = false;

  while (true) {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      LOGIN_REQUEST_TIMEOUT_MS,
    );

    let response: Response | undefined;
    let requestError: unknown;

    try {
      response = await apiFetch(path, { ...init, signal: controller.signal });
    } catch (error) {
      requestError = error;
    } finally {
      window.clearTimeout(timeout);
    }

    const transientResponse = response !== undefined &&
      [502, 503, 504].includes(response.status);
    const transientError = requestError !== undefined &&
      isTransientApiFailure(requestError);

    if (response !== undefined && !transientResponse) {
      return response;
    }

    if (requestError !== undefined && !transientError) {
      throw requestError;
    }

    if (!hasReportedWakeUp) {
      hasReportedWakeUp = true;
      onApiWaking?.();
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed >= LOGIN_RETRY_WINDOW_MS) {
      throw new Error(
        "The API hasn't responded yet. Please try again in a little while.",
      );
    }

    if (response) {
      await response.body?.cancel();
    }

    await new Promise<void>(resolve => {
      window.setTimeout(resolve, Math.min(LOGIN_RETRY_DELAY_MS, LOGIN_RETRY_WINDOW_MS - elapsed));
    });
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await apiFetch("/api/Auth/me");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data: User = await response.json();

        setUser(data);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (
    username: string,
    password: string,
    onApiWaking?: () => void,
  ): Promise<boolean> => {
    try {
      const response = await requestWhileApiWakes("/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }, onApiWaking);

      if (!response.ok) {
        setUser(null);
        return false;
      }

      const data = await response.json();

      setAccessToken(data.accessToken);

      const meResponse = await requestWhileApiWakes(
        "/api/Auth/me",
        { method: "GET" },
        onApiWaking,
      );

      if (!meResponse.ok) {
        setAccessToken(null);
        setUser(null);
        return false;
      }

      const user: User = await meResponse.json();

      setUser(user);

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await apiFetch("/api/Auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}