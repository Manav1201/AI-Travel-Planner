"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Compass, Menu, X, LogOut, User, Map } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <Compass className="h-6 w-6 text-indigo-400 animate-pulse" />
              </span>
              <span className="font-bold text-xl tracking-tight text-white">
                Vagabond<span className="text-indigo-400">.AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/plan-trip"
                  className="flex items-center gap-1.5 px-4 h-9 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  <Map className="h-3.5 w-3.5" />
                  Plan New Trip
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-indigo-300 hover:border-slate-600 focus:outline-none transition-colors"
                  >
                    {getInitials(user?.name)}
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-2xl ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-slate-800 mb-2">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
              >
                Dashboard
              </Link>
              <Link
                href="/plan-trip"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-indigo-400 hover:text-white hover:bg-indigo-950/20 rounded-xl"
              >
                Plan New Trip
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-base font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 text-center rounded-xl"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
