"use client";

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const LOADING_MESSAGES = [
  'Scouting hidden local street-food alleys...',
  'Checking historical landmark opening hours...',
  'Negotiating rates with top-rated hotels...',
  'Mapping out optimal driving and walking routes...',
  'Compiling custom weather-appropriate packing checklists...',
  'Double-checking coordinates of beautiful viewpoints...',
  'Generating realistic cost breakdown estimations...',
  'Polishing your day-by-day customized travel itinerary...',
  'Crafting the perfect travel layout for your next adventure...'
];

export default function Loader({ title = 'Creating Your Perfect Journey...' }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 text-center">
      <div className="relative flex flex-col items-center max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        {/* Spinner Compass */}
        <div className="relative p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-bounce mb-6">
          <Compass className="h-16 w-16 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {title}
        </h3>

        {/* Reusable Message Changer */}
        <div className="h-12 flex items-center justify-center">
          <p className="text-indigo-200/80 font-medium text-sm animate-pulse transition-all duration-500">
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress Bar Mock */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full animate-infinite-loading w-[60%]"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes infinite-loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-infinite-loading {
          animation: infinite-loading 1.8s infinite linear;
        }
      `}</style>
    </div>
  );
}
