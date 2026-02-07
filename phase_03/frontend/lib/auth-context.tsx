import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { setAccessToken as setGlobalAccessToken } from "./token-store";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setGlobalAccessToken(accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAccessToken = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAccessToken must be used within an AuthProvider");
  }
  return context;
};