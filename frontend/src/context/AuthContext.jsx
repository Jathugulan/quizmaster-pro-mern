import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { getToken, clearToken } from '../api/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore authenticated session from backend on first load
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (isMounted) {
          setUser(userData);
        }
      } catch (err) {
        console.warn('[AuthContext] Session initialization failed, clearing token:', err.message);
        clearToken();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    }

    initAuth();

    // Listen to global 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('quizmaster:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('quizmaster:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (identifier, password, role) => {
    const data = await authApi.login({ identifier, password, role });
    if (data?.user) {
      setUser(data.user);
      return data.user;
    }
    return null;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (data?.user) {
      setUser(data.user);
      return data.user;
    }
    return null;
  }, []);

  const googleLogin = useCallback(async (payload) => {
    const data = await authApi.googleLogin(payload);
    if (data?.user) {
      setUser(data.user);
      return data;
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch) => {
    const updated = await authApi.updateProfile(patch);
    if (updated) {
      setUser((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    return await authApi.updatePassword({ currentPassword, newPassword });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAuthenticated: !!user,
        login,
        signup,
        googleLogin,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;