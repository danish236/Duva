// mobile/src/context/AuthContext.tsx
import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext<any>(null);

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context easily
export const useAuth = () => useContext(AuthContext);