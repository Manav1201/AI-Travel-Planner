"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '@/context/AuthContext';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import {
  Compass, MapPin, Calendar, DollarSign, BedDouble, CheckSquare,
  FileDown, Plus, Trash2, RotateCcw, AlertCircle, Sparkles, Clock, Info, Check, CheckSquare as CheckboxIcon
} from 'lucide-react';

export default function TripWorkspace() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id;

  // Global State
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active UI states
  const [activeDay, setActiveDay] = useState(1);
  const [saveLoading, setSaveLoading] = useState(false);

  // Add Activity Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDayNum, setAddDayNum] = useState(1);
  const [newActivity, setNewActivity] = useState({
    time: 'Morning',
    activity: '',
    description: '',
    location: ''
  });

  // Regenerate Specific Day Panel State
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [regenDayNum, setRegenDayNum] = useState(1);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);

  // Fetch specific trip details
  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trips/${tripId}`);
      if (response.data.success) {
        setTrip(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError(
        err.response?.data?.error ||
        'Failed to load trip workspace. You might not have permission to view this trip.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // General Update Handler (Saves changes to MongoDB)
  const saveTripUpdates = async (updatedTrip) => {
    setSaveLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/trips/${tripId}`, updatedTrip);
      if (response.data.success) {
        setTrip(response.data.data);
      }
    } catch (err) {
      console.error('Error updating trip details:', err);
      alert('Failed to save your modifications. Please verify your connection.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 1. Toggle Packing Checklist Items
  const togglePackingItem = (itemId) => {
    if (!trip) return;
    const updatedPacking = trip.packingList.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    const updatedTrip = { ...trip, packingList: updatedPacking };
    setTrip(updatedTrip); // Update client instantly
    saveTripUpdates(updatedTrip); // Sync to DB
  };

  // 2. Remove an activity
  const handleDeleteActivity = (dayNum, activityId) => {
    if (!trip) return;
    if (!confirm('Are you sure you want to remove this activity from your itinerary?')) return;

    const updatedItinerary = trip.itinerary.map((dayItem) => {
      if (dayItem.day === dayNum) {
        return {
          ...dayItem,
          activities: dayItem.activities.filter((act) => act.id !== activityId)
        };
      }
      return dayItem;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    setTrip(updatedTrip);
    saveTripUpdates(updatedTrip);
  };

  // 3. Add an Activity Form Submission
  const handleAddActivitySubmit = (e) => {
    e.preventDefault();
    if (!newActivity.activity.trim()) {
      alert('Please enter an activity name');
      return;
    }

    const activityObj = {
      ...newActivity,
      id: Math.random().toString(36).substr(2, 9) // Unique client ID
    };

    const updatedItinerary = trip.itinerary.map((dayItem) => {
      if (dayItem.day === addDayNum) {
        return {
          ...dayItem,
          activities: [...dayItem.activities, activityObj]
        };
      }
      return dayItem;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    setTrip(updatedTrip);
    saveTripUpdates(updatedTrip);

    // Reset and Close Modal
    setNewActivity({ time: 'Morning', activity: '', description: '', location: '' });
    setIsAddModalOpen(false);
  };

  // 4. AI Regenerate Specific Day
  const handleRegenSubmit = async (e) => {
    e.preventDefault();
    if (!regenPrompt.trim()) {
      alert('Please specify what you would like to change on this day');
      return;
    }

    setRegenLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/regenerate-day`, {
        day: regenDayNum,
        prompt: regenPrompt.trim()
      });

      if (response.data.success) {
        setTrip(response.data.data);
        setIsRegenOpen(false);
        setRegenPrompt('');
      }
    } catch (err) {
      console.error('Error during AI day regeneration:', err);
      alert(err.response?.data?.error || 'AI regeneration failed. Please try again.');
    } finally {
      setRegenLoading(false);
    }
  };

  // 5. Offline PDF Export Trigger
  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 p-6">
        <div className="relative p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-pulse">
          <Compass className="h-10 w-10 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <p className="mt-4 text-sm text-slate-400 font-medium animate-pulse">
          Retrieving trip planner workspace...
        </p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <span className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
            <AlertCircle className="h-10 w-10" />
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Access Restrained or Not Found</h3>
        <p className="text-sm text-slate-400 mb-6">{error || 'This travel plan does not exist or has been deleted.'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Active timeline calculations
  const activeDayItinerary = trip.itinerary?.find((dayItem) => dayItem.day === activeDay) || { activities: [] };

  // Packing statistics
  const packedCount = trip.packingList?.filter((item) => item.packed).length || 0;
  const totalPackingCount = trip.packingList?.length || 0;
  const packingPercent = totalPackingCount > 0 ? Math.round((packedCount / totalPackingCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 min-h-[calc(100vh-4rem)] flex-1">
      
      {/* Dynamic Saving Indicator */}
      {saveLoading && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-semibold px-4 py-2 rounded-full shadow-2xl animate-pulse no-print">
          <Clock className="h-3.5 w-3.5 animate-spin" />
          Syncing changes with MongoDB...
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 mb-8 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${
              trip.budgetType === 'high' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' :
              trip.budgetType === 'medium' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
              'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {trip.budgetType} Budget Preference
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Trip to <span className="text-indigo-400">{trip.destination}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            {trip.duration} Days Customized Itinerary
          </p>
        </div>

        {/* Global actions */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-white shadow-lg transition-all"
          >
            <FileDown className="h-4 w-4" />
            Export PDF (Offline)
          </button>
          <button
            onClick={() => {
              setRegenDayNum(activeDay);
              setIsRegenOpen(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-xs font-semibold text-white shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate Day {activeDay}
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ITINERARY PLANNER (8/12 grid columns) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Day Tabs Timeline */}
          <div className="flex overflow-x-auto gap-2 pb-3 mb-6 scrollbar-thin no-print">
            {trip.itinerary?.map((dayItem) => (
              <button
                key={dayItem.day}
                onClick={() => setActiveDay(dayItem.day)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border shrink-0 transition-all ${
                  activeDay === dayItem.day
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                Day {dayItem.day}
              </button>
            ))}
            <button
              onClick={() => {
                setAddDayNum(activeDay);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold rounded-xl border border-dashed border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white shrink-0 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Activity
            </button>
          </div>

          {/* Timeline View */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 no-print">
              <h2 className="text-xl font-bold text-white">Day {activeDay} Schedule</h2>
              <span className="text-xs text-slate-500 font-semibold">{activeDayItinerary.activities.length} activities scheduled</span>
            </div>

            {/* Empty state for activities */}
            {activeDayItinerary.activities.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center mb-8">
                <p className="text-sm text-slate-400 mb-4">No activities scheduled for this day yet.</p>
                <button
                  onClick={() => {
                    setAddDayNum(activeDay);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add First Activity
                </button>
              </div>
            ) : (
              /* Timeline entries */
              <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-8 mb-8">
                {activeDayItinerary.activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Circle icon marker on timeline */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:scale-125 transition-transform" />

                    <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/50 p-5 rounded-2xl shadow-xl transition-all">
                      {/* Top row */}
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                            {act.time}
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight">{act.activity}</h3>
                        </div>
                        {/* Delete single activity */}
                        <button
                          onClick={() => handleDeleteActivity(activeDay, act.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 no-print"
                          title="Remove Activity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Description */}
                      {act.description && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">{act.description}</p>
                      )}

                      {/* Location details */}
                      {act.location && (
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                          <span>{act.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECOMMENDED HOTELS */}
          <div className="border-t border-slate-800 pt-8 mt-4 no-print">
            <h2 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-indigo-400" />
              Recommended Stays in {trip.destination}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              AI suggested hotel options aligned with rating records and budget categories.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {trip.hotels?.map((hotel, idx) => (
                <div
                  key={idx}
                  className="flex flex-col border border-slate-850 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40 p-5 rounded-2xl transition-all"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 border rounded-md shrink-0 ${
                      hotel.category === 'Luxury' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' :
                      hotel.category === 'Mid Range' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {hotel.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {hotel.priceRange || 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mb-1">{hotel.name}</h4>
                  
                  {/* Star rating */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-3">
                    <span>★</span>
                    <span>{hotel.rating?.toFixed(1) || '4.0'}</span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mt-auto">{hotel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUDGET breakdown & PACKING CHECKLIST (4/12 grid columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ESTIMATED BUDGET Breakdown */}
          <div className="border border-slate-850 bg-slate-900/20 p-6 rounded-3xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="h-5 w-5 text-indigo-400" />
              Estimated Expenses
            </h2>

            <div className="space-y-3.5 mt-4">
              {/* Flights */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">🛫 Flights</span>
                <span className="text-white font-bold">${trip.estimatedBudget?.flights || 0}</span>
              </div>
              {/* Accommodation */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">🏨 Lodging</span>
                <span className="text-white font-bold">${trip.estimatedBudget?.accommodation || 0}</span>
              </div>
              {/* Food */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">🍲 Meals & Dining</span>
                <span className="text-white font-bold">${trip.estimatedBudget?.food || 0}</span>
              </div>
              {/* Activities */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">🎟️ Excursions</span>
                <span className="text-white font-bold">${trip.estimatedBudget?.activities || 0}</span>
              </div>

              {/* Total Budget */}
              <div className="border-t border-slate-850 pt-4 mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Estimated Total</span>
                <span className="text-lg font-extrabold text-indigo-400">${trip.estimatedBudget?.total || 0} USD</span>
              </div>
            </div>
          </div>

          {/* AI PACKING ASSISTANT (Custom Feature 1) */}
          <div className="border border-slate-850 bg-slate-900/20 p-6 rounded-3xl shadow-xl">
            <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-400 animate-pulse" />
                AI Packing List
              </h2>
              {/* Stats progress bubble */}
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
                {packingPercent}% Packed
              </span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${packingPercent}%` }}
              />
            </div>

            {/* Empty Packing list fallback */}
            {!trip.packingList || trip.packingList.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No packing items generated for this trip.</p>
            ) : (
              /* Checklist loop */
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {trip.packingList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className="flex w-full items-start gap-3 p-2.5 text-left rounded-xl hover:bg-slate-900/40 border border-transparent hover:border-slate-850 transition-all text-xs"
                  >
                    {/* Checkbox Icon */}
                    <span className="mt-0.5 shrink-0">
                      {item.packed ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 border border-indigo-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="block h-4 w-4 rounded border border-slate-700 bg-slate-950" />
                      )}
                    </span>
                    {/* Text item and category */}
                    <div className="flex-1 overflow-hidden">
                      <span className={`block font-semibold text-slate-200 truncate ${item.packed ? 'line-through text-slate-500' : ''}`}>
                        {item.item}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                        {item.category || 'Other'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC DRAWERS & MODALS (no-print) */}

      {/* 1. ADD ACTIVITY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Custom Activity to Day ${addDayNum}`}
      >
        <form onSubmit={handleAddActivitySubmit} className="space-y-4 text-left">
          {/* Time select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Time of Day</label>
            <select
              value={newActivity.time}
              onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
              className="block w-full rounded-xl border-slate-800 bg-slate-950 py-3 px-3 text-white border text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          {/* Activity name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Activity Name</label>
            <input
              type="text"
              required
              value={newActivity.activity}
              onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
              className="block w-full rounded-xl border-slate-800 bg-slate-950 py-3 px-3 text-white border text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="e.g. Visit Eiffel Tower"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location/Landmark</label>
            <input
              type="text"
              value={newActivity.location}
              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
              className="block w-full rounded-xl border-slate-800 bg-slate-950 py-3 px-3 text-white border text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="e.g. Champ de Mars, Paris"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Brief Description</label>
            <textarea
              rows="3"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="block w-full rounded-xl border-slate-800 bg-slate-950 py-3 px-3 text-white border text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
              placeholder="Provide a quick note of what to do or reservation links here."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition-colors"
          >
            Add to Schedule
          </button>
        </form>
      </Modal>

      {/* 2. REGENERATE DAY PANEL MODAL (Requirement 5) */}
      <Modal
        isOpen={isRegenOpen}
        onClose={() => setIsRegenOpen(false)}
        title={`Regenerate Day ${regenDayNum} with AI`}
      >
        <form onSubmit={handleRegenSubmit} className="space-y-4 text-left">
          {regenLoading && <Loader title={`Instructing AI Agent to Redesign Day ${regenDayNum}...`} />}

          <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl text-indigo-300 text-xs">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Describe what changes you want to make for **Day {regenDayNum}**. Our AI agent will completely rebuild that specific day's activities to fulfill your directions while preserving the rest of your trip!
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Instructions for Day {regenDayNum}</label>
            <textarea
              rows="4"
              required
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              className="block w-full rounded-xl border-slate-800 bg-slate-950 py-3 px-3 text-white border text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
              placeholder="e.g., 'Make this day focused entirely on outdoor nature activities' or 'Add more high-rated museums and historical sites'."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={regenLoading}
            className="group w-full flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            Redesign Itinerary Day
          </button>
        </form>
      </Modal>

      {/* DISSOLVED PRINT FORMAT (Only active during window.print() triggered by Export PDF) */}
      <div className="hidden print:block text-black p-8 bg-white" style={{ fontFamily: 'sans-serif' }}>
        <div className="border-b-2 border-slate-350 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold">{trip.destination} Itinerary</h1>
          <p className="text-sm font-medium mt-1">A {trip.duration} Days Travel Guide — Budget Tier: {trip.budgetType.toUpperCase()}</p>
        </div>

        {/* Days loop */}
        {trip.itinerary?.map((dayItem) => (
          <div key={dayItem.day} className="mb-8 page-break-inside: avoid">
            <h2 className="text-xl font-bold border-b border-slate-200 pb-1.5 mb-4">Day {dayItem.day} Schedule</h2>
            <div className="space-y-4">
              {dayItem.activities.map((act) => (
                <div key={act.id} className="border border-slate-200 p-4 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-sm text-indigo-600">[{act.time}] {act.activity}</span>
                    {act.location && <span className="text-xs text-slate-500 font-medium">📍 {act.location}</span>}
                  </div>
                  {act.description && <p className="text-xs text-slate-600 leading-normal">{act.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Expenses */}
        <div className="mt-8 border-t-2 border-slate-300 pt-6 page-break-inside: avoid">
          <h2 className="text-xl font-bold mb-4">Estimated Budget Summary</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-sm font-bold">Category</th>
                <th className="py-2 text-sm font-bold text-right">Estimate (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 text-sm">
                <td className="py-2 text-slate-600">Flights</td>
                <td className="py-2 text-right font-bold">${trip.estimatedBudget?.flights || 0}</td>
              </tr>
              <tr className="border-b border-slate-100 text-sm">
                <td className="py-2 text-slate-600">Lodging (Accommodation)</td>
                <td className="py-2 text-right font-bold">${trip.estimatedBudget?.accommodation || 0}</td>
              </tr>
              <tr className="border-b border-slate-100 text-sm">
                <td className="py-2 text-slate-600">Dining & Meals</td>
                <td className="py-2 text-right font-bold">${trip.estimatedBudget?.food || 0}</td>
              </tr>
              <tr className="border-b border-slate-200 text-sm">
                <td className="py-2 text-slate-600">Activities & Excursions</td>
                <td className="py-2 text-right font-bold">${trip.estimatedBudget?.activities || 0}</td>
              </tr>
              <tr className="text-base font-bold">
                <td className="py-3 text-indigo-600">Total Estimated Expenses</td>
                <td className="py-3 text-right text-indigo-600 font-extrabold">${trip.estimatedBudget?.total || 0} USD</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hotels */}
        <div className="mt-8 border-t-2 border-slate-300 pt-6 page-break-inside: avoid">
          <h2 className="text-xl font-bold mb-4">Recommended Accommodation Options</h2>
          <div className="space-y-4">
            {trip.hotels?.map((hotel, idx) => (
              <div key={idx} className="border border-slate-200 p-4 rounded-xl text-sm">
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold">{hotel.name} ({hotel.category})</span>
                  <span className="font-bold text-indigo-600">{hotel.priceRange}</span>
                </div>
                <p className="text-slate-600 text-xs leading-normal">{hotel.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Packing items */}
        <div className="mt-8 border-t-2 border-slate-300 pt-6 page-break-inside: avoid">
          <h2 className="text-xl font-bold mb-4">AI Packing Checklist</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {trip.packingList?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs border border-slate-100 p-2 rounded-lg">
                <span className="block h-3.5 w-3.5 border border-slate-400 rounded-sm shrink-0" />
                <span className="font-semibold truncate">{item.item}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide ml-auto">({item.category})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
