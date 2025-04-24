
import { useState, useEffect } from 'react';
import { User, Session } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  return {
    user,
    setUser,
    session,
    setSession,
    isAuthenticated,
  };
};
