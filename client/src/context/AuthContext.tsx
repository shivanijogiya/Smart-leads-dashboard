import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/api/auth';
import type { AuthResponse, User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, role: UserRole): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const persistAuth = ({ token, user }: AuthResponse) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    if (cachedUser) {
      setUser(JSON.parse(cachedUser) as User);
    }

    authApi
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setIsBootstrapping(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      isLoading,
      login: async (email, password) => {
        setIsLoading(true);
        try {
          const auth = await authApi.login({ email, password });
          persistAuth(auth);
          setUser(auth.user);
        } finally {
          setIsLoading(false);
        }
      },
      register: async (name, email, password, role) => {
        setIsLoading(true);
        try {
          const auth = await authApi.register({ name, email, password, role });
          persistAuth(auth);
          setUser(auth.user);
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      },
    }),
    [isBootstrapping, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
