import { useState, useCallback } from 'react';

const AUTH_KEY = 'promptforge_auth';

export const useAuthSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return {
    isAuthenticated,
    login,
    logout
  };
};
