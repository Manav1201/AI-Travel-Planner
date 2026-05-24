"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Compass, Sparkles, MapPin, DollarSign, BedDouble, CheckSquare, FileDown, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      {/* Background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80caff] to-[#4f46e5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-24 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Animated Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-bounce mb-6">
            <Sparkles className="h-3 w-3" />
            Empowered by Gemini 1.5 Flash Agent
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Tailor-Made Journeys <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Curated by AI Agents
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-xl mx-auto">
            Say goodbye to endless planning tabs. Outline your timeline, budget, and travel style — our advanced AI compiles custom day-by-day activities, estimated expenses, hotel lists, and packing guidelines.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-indigo-500 hover:shadow-indigo-500/20 focus-visible:outline-none transition-all duration-300"
            >
              Start Planning Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
            >
              Explore Features <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-20 max-w-4xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-8 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <dt className="text-sm font-semibold leading-6 text-slate-400">Itineraries Generated</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                14,200+
              </dd>
            </div>
            <div className="flex flex-col items-center border-slate-800 sm:border-x">
              <dt className="text-sm font-semibold leading-6 text-slate-400">Perfect Trip Matching</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                99.4%
              </dd>
            </div>
            <div className="flex flex-col items-center">
              <dt className="text-sm font-semibold leading-6 text-slate-400">Planning Time Saved</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                12 Hrs/Trip
              </dd>
            </div>
          </dl>
        </div>

        {/* Features Section */}
        <div id="features" className="mx-auto mt-32 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Equipped with Next-Gen Travel Logic
            </h2>
            <p className="mt-4 text-slate-400 text-sm max-w-md mx-auto">
              Everything you need to conceptualize, modify, and pack for your dream trip in one singular dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Flexible Itinerary Agent</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate highly interactive day-by-day timelines. Drag-drop or add, delete, and request dynamic single-day AI regenerations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Budget Costing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get estimates on flights, lodging, activities, and dining matching your target spending profile (low, medium, or high).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all duration-300">
              <div className="flex p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                <BedDouble className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Curated Accommodation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Receive recommended hotel listings filtered by budget tiers and real traveler ratings, saving booking research hours.
              </p>
            </div>

            {/* Feature 4 (Custom Feature 1) */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Packing Assistant</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                An smart checklist tailored exactly to the climate, trip length, and interests of your destination. Check them off as you pack.
              </p>
            </div>

            {/* Feature 5 (Custom Feature 2) */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:bg-slate-900/50 transition-all duration-300 sm:col-span-2 lg:col-span-2">
              <div className="flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                <FileDown className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Beautiful Offline PDF Export</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Headed international or off-grid? Export your complete day-by-day plans, hotels, and packing lists into a clean, print-friendly designed PDF for offline access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background bottom circle */}
      <div className="absolute inset-x-0 top-[calc(100vh-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl">
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
