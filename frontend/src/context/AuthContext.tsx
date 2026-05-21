'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setCookie, getCookie, deleteCookie } from '@/utils/api';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'BUYER' | 'FREELANCER' | 'ADMIN';

interface User {
  id: string;
  username: string;
  email: string;
  fname: string;
  lname: string;
  overview?: string;
  country?: string;
  languages?: string[];
}

interface FreelancerProfile {
  id: string;
  buyer_id: string;
  job_title: string;
  overview: string;
  availability?: {
    start_day: string;
    end_day: string;
    start_hour: string;
    end_hour: string;
  };
}

interface AuthContextType {
  user: User | null;
  freelancer: FreelancerProfile | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('BUYER');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfiles = async () => {
    setLoading(true);
    // Fetch buyer details
    const meRes = await apiFetch<User>('/auth/me');
    if (meRes.success && meRes.data) {
      // Backend /auth/me structure can contain data inside data or be direct
      const userData = (meRes.data as any).user || meRes.data;
      setUser(userData as User);

      // Fetch freelancer profile
      const freeRes = await apiFetch<FreelancerProfile>('/freelancers/me');
      if (freeRes.success && freeRes.data) {
        const freeData = (freeRes.data as any).freelancer || freeRes.data;
        setFreelancer(freeData as FreelancerProfile);
      } else {
        setFreelancer(null);
      }
    } else {
      // Token invalid or expired
      deleteCookie('token');
      setUser(null);
      setFreelancer(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, userData: User) => {
    setCookie('token', token, 7);
    setUser(userData);
    
    // Fetch freelancer profile if any
    const freeRes = await apiFetch<FreelancerProfile>('/freelancers/me');
    if (freeRes.success && freeRes.data) {
      const freeData = (freeRes.data as any).freelancer || freeRes.data;
      setFreelancer(freeData as FreelancerProfile);
    } else {
      setFreelancer(null);
    }
    
    setActiveRole('BUYER');
    router.push('/');
  };

  const logout = () => {
    deleteCookie('token');
    setUser(null);
    setFreelancer(null);
    setActiveRole('BUYER');
    router.push('/login');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'FREELANCER' && !freelancer) {
      // Cannot switch to freelancer if not onboarded
      router.push('/settings');
      return;
    }
    setActiveRole(role);
  };

  const refreshUser = async () => {
    const token = getCookie('token');
    if (token) {
      await fetchProfiles();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        freelancer,
        isAuthenticated: !!user,
        activeRole,
        loading,
        login,
        logout,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
