import { useCallback, useEffect, useState } from 'react';
import { getMeRequest, loginRequest } from '../api/auth.js';
import { tokenStorage } from '../api/client.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()));

  const loadUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await getMeRequest();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await loginRequest(credentials);
    tokenStorage.set(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

