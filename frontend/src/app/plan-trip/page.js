"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '@/context/AuthContext';
import Loader from '@/components/Loader';
import { Compass, ArrowRight, ArrowLeft, Landmark, Wallet, Eye, Sparkles, AlertCircle } from 'lucide-react';

const INTERESTS_LIST = [
  { name: 'Food & Culinary', icon: '🍲' },
  { name: 'Culture & Heritage', icon: '🏛️' },
  { name: 'Adventure & Sports', icon: '🧗' },
  { name: 'Shopping & Fashion', icon: '🛍️' },
  { name: 'Nature & Wildlife', icon: '⛰️' },
  { name: 'Relaxation & Wellness', icon: '🧘' },
  { name: 'Art & Photography', icon: '📸' },
  { name: 'Nightlife & Socials', icon: '🍻' },
  { name: 'History & Museums', icon: '🏺' }
];

export default function PlanTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budgetType, setBudgetType] = useState('medium');
  const [interests, setInterests] = useState([]);

  // Interests Toggle
  const toggleInterest = (interestName) => {
    if (interests.includes(interestName)) {
      setInterests(interests.filter((i) => i !== interestName));
    } else {
      setInterests([...interests, interestName]);
    }
  };

  // Submit Itinerary Generation
  const handleSubmit = async () => {
    if (!destination.trim()) {
      setError('Please provide a valid destination city or country');
      setStep(1);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/trips`, {
        destination: destination.trim(),
        duration,
        budgetType,
        interests
      });

      if (response.data.success) {
        // Redirect to newly generated trip page
        router.push(`/trip/${response.data.data._id}`);
      }
    } catch (err) {
      console.error('Itinerary generation error:', err);
      setError(
        err.response?.data?.error ||
        'An error occurred while communicating with the AI Travel Planner Agent. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 lg:px-8 bg-slate-950 min-h-[calc(100vh-4rem)]">
      {loading && <Loader title="Consulting Vagabond AI Travel Agent..." />}

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Stepper indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
        </div>

        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Outline your next <span className="text-indigo-400">Adventure</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Tell us about your timeline, spending levels, and interests. Our AI handles the rest.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: DESTINATION & DURATION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-semibold leading-6 text-white mb-2">
                  Where do you want to go?
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-slate-950 py-3.5 px-4 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm focus:outline-none transition-all"
                    placeholder="e.g. Kyoto, Japan or Paris, France"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 pl-1">
                  Specify any specific city, state, or country.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold leading-6 text-white mb-2 flex justify-between items-center">
                  <span>How many days?</span>
                  <span className="text-indigo-400 font-bold text-sm bg-indigo-500/10 px-2.5 py-0.5 rounded-full">{duration} Days</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 px-1 mt-1.5">
                  <span>1 Day</span>
                  <span>5 Days</span>
                  <span>10 Days</span>
                  <span>15 Days</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!destination.trim()) {
                      setError('Destination cannot be empty');
                    } else {
                      setError('');
                      setStep(2);
                    }
                  }}
                  className="group flex w-full justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all duration-200"
                >
                  Configure Budget
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET TYPE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <label className="block text-sm font-semibold leading-6 text-white">
                Choose your budget profile
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Low Budget */}
                <button
                  type="button"
                  onClick={() => setBudgetType('low')}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                    budgetType === 'low'
                      ? 'border-indigo-500 bg-indigo-500/5 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1">🏷️</span>
                  <span className="font-bold text-sm">Low Budget</span>
                  <span className="text-[10px] text-slate-400 mt-1">Hostels & Street Food</span>
                </button>

                {/* Medium Budget */}
                <button
                  type="button"
                  onClick={() => setBudgetType('medium')}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                    budgetType === 'medium'
                      ? 'border-indigo-500 bg-indigo-500/5 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1">✈️</span>
                  <span className="font-bold text-sm">Medium Budget</span>
                  <span className="text-[10px] text-slate-400 mt-1">Hotels & Diners</span>
                </button>

                {/* High Budget */}
                <button
                  type="button"
                  onClick={() => setBudgetType('high')}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                    budgetType === 'high'
                      ? 'border-indigo-500 bg-indigo-500/5 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1">💎</span>
                  <span className="font-bold text-sm">High Budget</span>
                  <span className="text-[10px] text-slate-400 mt-1">Luxury & Fine Dining</span>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 w-1/3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-750 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="group flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all duration-200"
                >
                  Select Interests
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS SELECTION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <label className="block text-sm font-semibold leading-6 text-white">
                What are your main travel styles? (Select all that apply)
              </label>

              <div className="flex flex-wrap gap-2.5">
                {INTERESTS_LIST.map((item) => {
                  const isSelected = interests.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleInterest(item.name)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md hover:bg-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 w-1/3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-750 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="group flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-xl hover:opacity-90 transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generate Itinerary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
