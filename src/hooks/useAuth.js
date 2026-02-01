import { useCallback } from 'react';

export default function useAuth() {
  const user = JSON.parse(localStorage.getItem('dastak_user') || 'null');

  const login = useCallback((payload) => {
    localStorage.setItem('dastak_user', JSON.stringify(payload));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dastak_user');
  }, []);

  const requireAuth = useCallback(() => {
    return !!localStorage.getItem('dastak_user');
  }, []);

  return { user, login, logout, requireAuth };
}
