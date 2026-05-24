const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true // e.g., Morning, Afternoon, Evening
  },
  activity: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
});

const DaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  activities: [ActivitySchema]
});

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true // e.g. Budget Friendly, Mid Range, Luxury
  },
  priceRange: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
});

const PackingItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  item: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Clothing', 'Documents', 'Toiletries', 'Gear', 'Other'],
    default: 'Other'
  },
  packed: {
    type: Boolean,
    default: false
  }
});

const TripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Please add the duration of the trip (in days)'],
      min: [1, 'Trip must be at least 1 day long']
    },
    budgetType: {
      type: String,
      required: [true, 'Please select a budget preference'],
      enum: ['low', 'medium', 'high']
    },
    interests: {
      type: [String],
      default: []
    },
    itinerary: [DaySchema],
    estimatedBudget: {
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    hotels: [HotelSchema],
    packingList: [PackingItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trip', TripSchema);
