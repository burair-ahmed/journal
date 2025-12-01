import { createContext, useContext } from "react";
import { useAuth, AuthUser } from "@/hooks/useAuth";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  // Impersonation
  impersonatedUserId: string | null;
  impersonatedUserEmail: string | null;
  effectiveUserId: string | undefined;
  isImpersonating: boolean;
  startImpersonation: (userId: string, email: string) => void;
  stopImpersonation: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
