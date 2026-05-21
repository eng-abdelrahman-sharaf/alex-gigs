'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { UserPlus, User, Mail, Key, Globe, AlertTriangle } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fname: '',
    lname: '',
    overview: '',
    country: 'Egypt',
    languages: 'Arabic, English',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const languagesArray = formData.languages
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fname: formData.fname,
      lname: formData.lname,
      overview: formData.overview || 'Looking for excellent services.',
      country: formData.country,
      languages: languagesArray,
    };

    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      const { token, user } = res.data;
      await login(token, user);
    } else {
      setError(res.error || 'Registration failed. Username or email might be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg rounded-2xl glass-panel p-8 shadow-2xl relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <UserPlus className="h-8 w-8" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
              Join AlexGigs Marketplace
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Create your account to start hire and deliver services
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  First Name
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    placeholder="Ahmed"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Last Name
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    placeholder="Ali"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Username
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="ahmed_gigs"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ahmed@example.eg"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Country
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Egypt"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Languages (Comma-separated)
                </label>
                <div className="mt-1.5 relative flex items-center rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                  <div className="pl-3.5 text-slate-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="Arabic, English"
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Overview / Bio
              </label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                placeholder="Brief description about yourself..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-gold-500/15 bg-basalt-900 p-3.5 text-xs text-slate-200 outline-none focus:border-gold-500/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-gold-500/10 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-basalt-950 border-t-transparent"></span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-gold-400 hover:text-gold-300 transition-colors">
              Sign in instead
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
