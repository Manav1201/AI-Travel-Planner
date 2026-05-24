"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-950 min-h-[calc(100vh-4rem)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Compass className="h-8 w-8 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold leading-9 tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold leading-6 text-white mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-slate-950 py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:leading-6 focus:outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold leading-6 text-white mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-slate-950 py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:leading-6 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-none disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Verifying...' : 'Sign In'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
