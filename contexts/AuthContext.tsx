import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  continueAsGuest as continueAsGuestSession,
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  PublicUser,
  signup as signupUser,
  subscribeToAuthChanges,
} from '../services/auth';

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  login: typeof loginUser;
  signup: typeof signupUser;
  continueAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(() => getCurrentUser());

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setUser(getCurrentUser());
    });

    setUser(getCurrentUser());
    return unsubscribe;
  }, []);

  const login: typeof loginUser = async (input) => {
    const result = await loginUser(input);
    setUser(getCurrentUser());
    return result;
  };

  const signup: typeof signupUser = async (input) => {
    const result = await signupUser(input);
    setUser(getCurrentUser());
    return result;
  };

  const continueAsGuest = () => {
    continueAsGuestSession();
    setUser(getCurrentUser());
  };

  const logout = () => {
    logoutUser();
    setUser(getCurrentUser());
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      continueAsGuest,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
