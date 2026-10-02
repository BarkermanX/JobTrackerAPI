import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "./api";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
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

  const login = async () => {
    try {
        const response = await apiFetch("/api/Auth/me");

        if (!response.ok) {
        setUser(null);
        return false;
        }

        const data: User = await response.json();

        setUser(data);

        return true;
    } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        return false;
    }
    };

  const logout = async () => {
    try {
      const response = await fetch("/api/Auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

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