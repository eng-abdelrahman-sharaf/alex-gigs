'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Compass, 
  Briefcase, 
  User, 
  Shield, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ChevronDown, 
  Settings, 
  Coins 
} from 'lucide-react';

export default function Navbar() {
  const { user, freelancer, activeRole, switchRole, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gold-500/10 bg-basalt-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-wider text-gold-500 font-heading">
                ALEX<span className="text-teal-400 group-hover:text-gold-400 transition-colors">GIGS</span>
              </span>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                EG
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/gigs"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 ${
                isActive('/gigs')
                  ? 'text-gold-400 border-b border-gold-400 pb-0.5'
                  : 'text-slate-400 hover:text-gold-400'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Browse Gigs</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/orders"
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive('/orders')
                      ? 'text-gold-400 border-b border-gold-400 pb-0.5'
                      : 'text-slate-400 hover:text-gold-400'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>My Orders</span>
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'text-gold-400 border-b border-gold-400 pb-0.5'
                      : 'text-slate-400 hover:text-gold-400'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                {activeRole === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'text-teal-400 border-b border-teal-400 pb-0.5'
                        : 'text-slate-400 hover:text-teal-400'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side Options (Auth Controls + Role Switcher) */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Role Switcher Pill */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 rounded-full border border-gold-500/20 bg-basalt-900 px-3.5 py-1.5 text-xs font-semibold text-gold-400 hover:border-gold-500/40 hover:bg-basalt-800 transition-all duration-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    <span>Role: {activeRole}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gold-500/10 bg-basalt-900/95 p-1 shadow-2xl backdrop-blur-md">
                      <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500">
                        Switch Active view
                      </div>
                      <button
                        onClick={() => {
                          switchRole('BUYER');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeRole === 'BUYER'
                            ? 'bg-gold-500/15 text-gold-400'
                            : 'text-slate-300 hover:bg-basalt-800'
                        }`}
                      >
                        Buyer View
                      </button>
                      <button
                        onClick={() => {
                          if (freelancer) {
                            switchRole('FREELANCER');
                          } else {
                            // Onboard first
                            switchRole('FREELANCER');
                          }
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          activeRole === 'FREELANCER'
                            ? 'bg-gold-500/15 text-gold-400'
                            : 'text-slate-300 hover:bg-basalt-800'
                        }`}
                      >
                        <span>Freelancer View</span>
                        {!freelancer && (
                          <span className="text-[9px] bg-gold-600/20 text-gold-400 px-1 py-0.5 rounded border border-gold-600/30">
                            Onboard
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          switchRole('ADMIN');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeRole === 'ADMIN'
                            ? 'bg-teal-500/15 text-teal-400'
                            : 'text-slate-300 hover:bg-basalt-800'
                        }`}
                      >
                        Admin View
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Link or welcome */}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-300">
                    {user?.fname} {user?.lname}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    @{user?.username}
                  </span>
                </div>

                {/* Settings & Logout */}
                <Link
                  href="/settings"
                  className="p-2 rounded-full text-slate-400 hover:text-gold-400 hover:bg-basalt-900 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-4.5 w-4.5" />
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all duration-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-gold-400 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-200"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
