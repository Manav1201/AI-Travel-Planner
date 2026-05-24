const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');
const { generateTripData, regenerateDayData } = require('../services/gemini');

// All routes here are protected
router.use(protect);

// @desc    Get all trips of the logged-in user
// @route   GET /api/trips
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    return res.status(500).json({ success: false, error: 'Server error fetching trips' });
  }
});

// @desc    Get a single trip by ID (with isolation check)
// @route   GET /api/trips/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.id || req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Strict Data Isolation Check
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this trip' });
    }

    return res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Error fetching trip:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.status(500).json({ success: false, error: 'Server error fetching trip details' });
  }
});

// @desc    Create a new AI-generated trip
// @route   POST /api/trips
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { destination, duration, budgetType, interests } = req.body;

    if (!destination || !duration || !budgetType) {
      return res.status(400).json({ success: false, error: 'Please provide destination, duration, and budgetType' });
    }

    const tripDuration = parseInt(duration, 10);
    if (isNaN(tripDuration) || tripDuration < 1) {
      return res.status(400).json({ success: false, error: 'Duration must be a positive number' });
    }

    // Call our AI service
    const aiResponse = await generateTripData(
      destination,
      tripDuration,
      budgetType,
      interests || []
    );

    // Save trip to database
    const trip = new Trip({
      userId: req.user._id,
      destination,
      duration: tripDuration,
      budgetType,
      interests: interests || [],
      itinerary: aiResponse.itinerary,
      estimatedBudget: aiResponse.estimatedBudget,
      hotels: aiResponse.hotels,
      packingList: aiResponse.packingList
    });

    const savedTrip = await trip.save();
    return res.status(201).json({ success: true, data: savedTrip });
  } catch (error) {
    console.error('Error creating trip:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error creating trip' });
  }
});

// @desc    Update a trip (e.g. check/uncheck packing list or modify itinerary activities)
// @route   PUT /api/trips/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Strict Data Isolation Check
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this trip' });
    }

    // Perform updates
    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Error updating trip:', error.message);
    return res.status(500).json({ success: false, error: 'Server error updating trip' });
  }
});

// @desc    Regenerate a specific day of the trip's itinerary
// @route   POST /api/trips/:id/regenerate-day
// @access  Private
router.post('/:id/regenerate-day', async (req, res) => {
  try {
    const { day, prompt } = req.body;
    
    if (day === undefined || !prompt) {
      return res.status(400).json({ success: false, error: 'Please specify the day number and the modification prompt' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Strict Data Isolation Check
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this trip' });
    }

    const dayIndex = trip.itinerary.findIndex(item => item.day === Number(day));
    if (dayIndex === -1) {
      return res.status(400).json({ success: false, error: `Day ${day} is not within this trip duration` });
    }

    const currentDayActivities = trip.itinerary[dayIndex].activities;

    // Call AI to generate alternative day activities
    const regeneratedDay = await regenerateDayData(
      trip.destination,
      day,
      currentDayActivities,
      prompt,
      trip.budgetType
    );

    // Update specific day itinerary
    trip.itinerary[dayIndex].activities = regeneratedDay.activities;
    
    const savedTrip = await trip.save();
    return res.json({ success: true, data: savedTrip });
  } catch (error) {
    console.error('Error regenerating day:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Server error regenerating day' });
  }
});

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Strict Data Isolation Check
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this trip' });
    }

    await trip.deleteOne();
    return res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting trip:', error.message);
    return res.status(500).json({ success: false, error: 'Server error deleting trip' });
  }
});

module.exports = router;
