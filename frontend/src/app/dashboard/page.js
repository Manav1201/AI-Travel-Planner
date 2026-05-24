"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '@/context/AuthContext';
import { Compass, Calendar, DollarSign, MapPin, Plus, Trash2, ArrowUpRight, Award, Footprints } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user trips
  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trips`);
      if (response.data.success) {
        setTrips(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Could not retrieve your trips. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTrips();
    }
  }, [user, authLoading]);

  // Delete trip
  const handleDeleteTrip = async (id, e) => {
    e.preventDefault(); // Prevent navigating to detail page if clicked inside card
    if (!confirm('Are you sure you want to delete this trip itinerary? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/trips/${id}`);
      if (response.data.success) {
        setTrips(trips.filter((trip) => trip._id !== id));
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete the trip. Please try again.');
    }
  };

  // Calculations for stats
  const totalTrips = trips.length;
  const totalDays = trips.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalBudget = trips.reduce((acc, curr) => acc + (curr.estimatedBudget?.total || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 p-6">
        <div className="relative p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-pulse">
          <Compass className="h-10 w-10 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <p className="mt-4 text-sm text-slate-400 font-medium animate-pulse">
          Opening your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 min-h-[calc(100vh-4rem)] flex-1 flex flex-col">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Welcome back, <span className="text-indigo-400">{user?.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and manage your planned adventures or outline a brand new journey.
          </p>
        </div>
        <Link
          href="/plan-trip"
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all hover:shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Plan New Trip
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {/* Stat 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex items-center gap-4">
          <div className="flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Journeys</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalTrips} Planned</h3>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex items-center gap-4">
          <div className="flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Footprints className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Travel Days</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalDays} Days</h3>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex items-center gap-4">
          <div className="flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Budget Planned</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">${totalBudget.toLocaleString()} USD</h3>
          </div>
        </div>
      </div>

      {/* Trips Section */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">Your Scheduled Itineraries</h2>

        {trips.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <div className="p-4 bg-indigo-500/5 rounded-full border border-indigo-500/10 mb-4">
              <MapPin className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No itineraries found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              You haven't planned any trips yet. Provide a destination, choose budget preferences, and generate a day-by-day plan instantly with AI.
            </p>
            <Link
              href="/plan-trip"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all hover:shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              Create Your First Trip
            </Link>
          </div>
        ) : (
          /* Grid of Trips */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col p-6"
              >
                {/* Upper row */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">
                      {trip.destination}
                    </h3>
                  </div>
                  {/* Budget Tag */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md shrink-0 ${
                    trip.budgetType === 'high'
                      ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                      : trip.budgetType === 'medium'
                      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {trip.budgetType} Budget
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{trip.duration} Days Journey</span>
                </div>

                {/* Interest Pills */}
                {trip.interests && trip.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-6">
                    {trip.interests.slice(0, 3).map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {trip.interests.length > 3 && (
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        +{trip.interests.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action panel */}
                <div className="mt-auto border-t border-slate-800/60 pt-4 flex justify-between items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteTrip(trip._id, e)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Itinerary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/trip/${trip._id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white px-3.5 py-2 rounded-lg border border-slate-700 group-hover:border-indigo-500 transition-all duration-300"
                  >
                    Open Workspace
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
