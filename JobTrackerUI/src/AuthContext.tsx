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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    password: string
  ): Promise<boolean> => {
    try {

      console.log("LOGIN:", {
        username,
        passwordLength: password?.length,
      });

      const response = await apiFetch("/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        setUser(null);
        return false;
      }

      const data = await response.json();

      setAccessToken(data.accessToken);

      const meResponse = await apiFetch("/api/Auth/me");

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
      return false;
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