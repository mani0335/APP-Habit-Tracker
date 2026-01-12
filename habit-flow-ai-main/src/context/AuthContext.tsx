import React, { createContext, useContext, useEffect, useState } from "react";

type CurrentUser = { id: string; name: string; email: string } | null;

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: CurrentUser;
  login: (user?: CurrentUser, asAdmin?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("hf_auth");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed.isAuthenticated;
    } catch {
      return false;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("hf_auth");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed.isAdmin;
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const raw = localStorage.getItem("hf_auth");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.currentUser ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(
          "hf_auth",
          JSON.stringify({ isAuthenticated: true, isAdmin, currentUser })
        );
      } else {
        localStorage.removeItem("hf_auth");
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated, isAdmin, currentUser]);

  const login = (user: CurrentUser | undefined = undefined, asAdmin = false) => {
    if (user) setCurrentUser(user);
    setIsAdmin(asAdmin);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAdmin(false);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
