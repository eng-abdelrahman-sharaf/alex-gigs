'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { LogIn, Key, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (res.success && res.data) {
      const { token, user } = res.data;
      await login(token, user);
    } else {
      setError(res.error || 'Invalid credentials or connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md rounded-2xl glass-panel p-8 shadow-2xl relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <LogIn className="h-8 w-8" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
              Welcome back to AlexGigs
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Sign in to manage bookings and active orders
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                <div className="pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="name@gigs.eg"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                <div className="pl-3.5 text-slate-500">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-gold-500/10 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-basalt-950 border-t-transparent"></span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-gold-400 hover:text-gold-300 transition-colors">
              Create one now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
