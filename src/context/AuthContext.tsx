'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usr: email, pwd: password }),
    });

    const data = await res.json();
    console.log('Login Response:', data);

    if (data.message === 'Logged In') {
      const userData: User = { name: data.full_name, email };
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify({ user: userData }));
      router.push('/dashboard');
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const logout = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    localStorage.removeItem('auth');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}