const { GoogleGenAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables. Falling back to Mock AI Generator.');
    return null;
  }
  // Standard SDK initialization
  // Note: Depending on the version of @google/generative-ai, it could be:
  // const { GoogleGenerativeAI } = require('@google/generative-ai');
  // or GoogleGenAI.
  // We'll require GoogleGenerativeAI as it is the most standard, but let's check.
  // Wait, let's write a flexible import that supports both.
  const sdk = require('@google/generative-ai');
  const ClientClass = sdk.GoogleGenerativeAI || sdk.GoogleGenAI;
  return new ClientClass(apiKey);
};

/**
 * Generate a complete trip itinerary, budget, hotels, and packing list
 */
const generateTripData = async (destination, duration, budgetType, interests) => {
  const client = getGeminiClient();
  const interestsStr = interests.length > 0 ? interests.join(', ') : 'General sightseeing';

  if (!client) {
    return generateMockTripData(destination, duration, budgetType, interests);
  }

  try {
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `
      You are an expert AI Travel Planner agent. Generate a comprehensive, premium, day-by-day travel plan for a trip to:
      Destination: ${destination}
      Duration: ${duration} Days
      Budget Type: ${budgetType} (low, medium, or high)
      Interests: ${interestsStr}

      Provide your response in JSON format. The JSON MUST strictly follow this schema:
      {
        "estimatedBudget": {
          "flights": number (realistic flight cost estimate in USD based on destination),
          "accommodation": number (realistic lodging cost in USD for the entire duration),
          "food": number (realistic food expense in USD for the entire duration),
          "activities": number (realistic activity expense in USD for the entire duration),
          "total": number (sum of flights, accommodation, food, activities)
        },
        "hotels": [
          {
            "name": "string (name of a real hotel matching the destination and budget)",
            "category": "string ('Budget Friendly' or 'Mid Range' or 'Luxury')",
            "priceRange": "string (e.g. '$60/night')",
            "rating": number (between 3.5 and 5.0),
            "description": "string (appealing description of the hotel and why it fits)"
          }
        ],
        "packingList": [
          {
            "item": "string (item name, e.g. 'Waterproof jacket')",
            "category": "string ('Clothing' or 'Documents' or 'Toiletries' or 'Gear' or 'Other' based on what type of item it is)"
          }
        ],
        "itinerary": [
          {
            "day": number (e.g. 1),
            "activities": [
              {
                "time": "string (e.g. 'Morning', 'Afternoon', 'Evening')",
                "activity": "string (short activity name, e.g. 'Visit Tokyo Skytree')",
                "description": "string (compelling, brief 2-sentence description of what to do there)",
                "location": "string (landmark/neighborhood name)"
              }
            ]
          }
        ]
      }

      Guidelines:
      - Customize the itinerary deeply based on the duration, budget (${budgetType}), and interests (${interestsStr}).
      - Provide exactly ${duration} days in the itinerary.
      - Ensure hotels has exactly 3 recommendations: one "Budget Friendly", one "Mid Range", and one "Luxury".
      - Generate a custom packing list (at least 8-12 items) tailored to the destination's climate/culture and the chosen interests (e.g. swimsuits for beach, gear for adventure, good walking shoes for culture/shopping).
      - Ensure you return ONLY valid, stringified JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Add unique UUID IDs to all activities and packing list items for React keys & edits
    if (data.itinerary) {
      data.itinerary = data.itinerary.map(day => ({
        ...day,
        activities: (day.activities || []).map(act => ({
          ...act,
          id: uuidv4()
        }))
      }));
    }

    if (data.packingList) {
      data.packingList = data.packingList.map(pack => ({
        ...pack,
        id: uuidv4(),
        packed: false
      }));
    }

    return data;
  } catch (error) {
    console.error('Error invoking Gemini API:', error);
    console.log('Falling back to premium Mock Travel Generator due to API error.');
    return generateMockTripData(destination, duration, budgetType, interests);
  }
};

/**
 * Regenerate a specific day of an itinerary based on user instructions
 */
const regenerateDayData = async (destination, dayNumber, currentDayActivities, userPrompt, budgetType) => {
  const client = getGeminiClient();

  if (!client) {
    return generateMockDayRegeneration(dayNumber, userPrompt);
  }

  try {
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const currentActivitiesStr = JSON.stringify(currentDayActivities);

    const prompt = `
      You are an expert AI Travel Planner agent. The user wants to modify Day ${dayNumber} of their trip to ${destination}.
      Budget Preference: ${budgetType}

      Current activities for Day ${dayNumber}:
      ${currentActivitiesStr}

      User's request for regenerating Day ${dayNumber}:
      "${userPrompt}"

      Based on this request, redesign the activities for Day ${dayNumber}.
      Provide your response in JSON format. The JSON MUST strictly follow this schema:
      {
        "day": ${dayNumber},
        "activities": [
          {
            "time": "string (e.g. 'Morning', 'Afternoon', 'Evening')",
            "activity": "string (short activity name)",
            "description": "string (compelling 2-sentence description)",
            "location": "string (landmark/neighborhood name)"
          }
        ]
      }

      Guidelines:
      - Completely rewrite or update the activities for Day ${dayNumber} to fulfill the user's specific request.
      - Ensure you return ONLY valid, stringified JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Map UUIDs to the regenerated activities
    if (data.activities) {
      data.activities = data.activities.map(act => ({
        ...act,
        id: uuidv4()
      }));
    }

    return data;
  } catch (error) {
    console.error('Error regenerating day with Gemini API:', error);
    return generateMockDayRegeneration(dayNumber, userPrompt);
  }
};

/**
 * Mock generator for offline/fallback mode (High quality)
 */
function generateMockTripData(destination, duration, budgetType, interests) {
  console.log(`Generating highly customized Mock Data for ${destination} (${duration} Days, Budget: ${budgetType})`);
  
  // Calculate budget factors
  const factor = budgetType === 'low' ? 0.6 : budgetType === 'medium' ? 1.0 : 1.8;
  const flights = Math.round(350 * factor);
  const accommodation = Math.round(80 * duration * factor);
  const food = Math.round(40 * duration * factor);
  const activitiesCost = Math.round(30 * duration * factor);
  const total = flights + accommodation + food + activitiesCost;

  const interestsStr = interests.length > 0 ? interests.join(' and ') : 'Sightseeing';

  const mockHotels = [
    {
      name: `${destination} Cozy Inn`,
      category: 'Budget Friendly',
      priceRange: `$${Math.round(45 * factor)}/night`,
      rating: 4.2,
      description: 'A charming, highly-rated spot close to public transport, perfect for cost-conscious travelers.'
    },
    {
      name: `${destination} Plaza Hotel`,
      category: 'Mid Range',
      priceRange: `$${Math.round(95 * factor)}/night`,
      rating: 4.6,
      description: 'Features a sky lounge, local breakfast buffet, and highly responsive concierge service.'
    },
    {
      name: `The Grand ${destination} Resort & Spa`,
      category: 'Luxury',
      priceRange: `$${Math.round(250 * factor)}/night`,
      rating: 4.9,
      description: 'Five-star indulgence featuring premium views, bespoke designer suites, and standard infinity pool.'
    }
  ];

  const mockPacking = [
    { id: uuidv4(), item: 'Valid Passport & Travel Documents', category: 'Documents', packed: false },
    { id: uuidv4(), item: 'Universal Power Adapter', category: 'Gear', packed: false },
    { id: uuidv4(), item: 'Comfortable Walking Shoes', category: 'Clothing', packed: false },
    { id: uuidv4(), item: 'Toiletry Bag & Toothbrush', category: 'Toiletries', packed: false },
    { id: uuidv4(), item: 'Noise-Canceling Headphones', category: 'Gear', packed: false },
    { id: uuidv4(), item: 'Weather-appropriate jackets/layers', category: 'Clothing', packed: false },
    { id: uuidv4(), item: `Activewear (for ${interestsStr} activities)`, category: 'Clothing', packed: false },
    { id: uuidv4(), item: 'Hand sanitizer & travel wipes', category: 'Toiletries', packed: false }
  ];

  if (interests.includes('Adventure')) {
    mockPacking.push({ id: uuidv4(), item: 'Refillable Hydration Flask', category: 'Gear', packed: false });
    mockPacking.push({ id: uuidv4(), item: 'First-aid mini kit', category: 'Gear', packed: false });
  }
  if (interests.includes('Food')) {
    mockPacking.push({ id: uuidv4(), item: 'Digestive Enzymes / Antacids', category: 'Toiletries', packed: false });
  }

  const activitiesPool = [
    { time: 'Morning', activity: 'Local Landmark Exploration', description: `Begin your morning taking in the breathtaking history at the primary heritage site in ${destination}.`, location: 'Historical Quarter' },
    { time: 'Afternoon', activity: `Immersive ${interestsStr} Tour`, description: `Dive deep into your interests. Meet local experts and experience hands-on workshops.`, location: 'City Center' },
    { time: 'Evening', activity: 'Scenic Dining & Sunset Walk', description: `Unwind with highly recommended local specialties and a sunset stroll alongside majestic views.`, location: 'Riverside Promenade' }
  ];

  const itinerary = [];
  for (let d = 1; d <= duration; d++) {
    const dayActivities = activitiesPool.map(act => ({
      ...act,
      id: uuidv4(),
      activity: d === 1 ? `Welcome to ${destination} - ${act.activity}` : `${act.activity} (Day ${d})`
    }));
    itinerary.push({
      day: d,
      activities: dayActivities
    });
  }

  return {
    estimatedBudget: { flights, accommodation, food, activities: activitiesCost, total },
    hotels: mockHotels,
    packingList: mockPacking,
    itinerary
  };
}

function generateMockDayRegeneration(dayNumber, userPrompt) {
  console.log(`Mocking regeneration of Day ${dayNumber} with prompt: "${userPrompt}"`);
  return {
    day: Number(dayNumber),
    activities: [
      {
        id: uuidv4(),
        time: 'Morning',
        activity: `Specialist Morning: Focus on "${userPrompt.slice(0, 25)}"`,
        description: `Custom planned activity structured for your custom request: "${userPrompt}". Ideal morning option.`,
        location: 'Scenic Viewpoint'
      },
      {
        id: uuidv4(),
        time: 'Afternoon',
        activity: `Exploration & Adventure themed to "${userPrompt.slice(0, 25)}"`,
        description: `Highly responsive activity generated according to your preference. Includes local guidance.`,
        location: 'Creative District'
      },
      {
        id: uuidv4(),
        time: 'Evening',
        activity: `Exclusive Gathering: Celebrating ${userPrompt.slice(0, 15)}`,
        description: `Top-rated culinary experience matching your request. Excellent sunset lighting.`,
        location: 'Culinary Lane'
      }
    ]
  };
}

module.exports = {
  generateTripData,
  regenerateDayData
};
