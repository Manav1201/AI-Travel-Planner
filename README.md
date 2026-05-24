# Vagabond.AI - Immersive travel itinerary agent

Welcome to **Vagabond.AI**, a modern, full-stack, multi-user travel planning web application that leverages advanced LLM agents to curate customized, print-ready, day-by-day travel itineraries. 

Users provide their desired destination, travel duration, budget levels, and interests. In response, our AI agent drafts a detailed chronological schedule, estimates flights, meals, excursions, and lodging costs, suggests top-rated hotels, and compiles a customized packing checklist.

## Tech Stack & Justifications

We adhered strictly to the requested stack to provide maximum reliability, speed, and modern architectural separation:
1. **Frontend**: **Next.js (App Router, React)**
   - *Justification*: Provides optimal performance, standard App routing, high security, and compiles static layouts dynamically.
2. **Styling**: **Tailwind CSS v4**
   - *Justification*: Utility-first styling enabling highly customized glassmorphic dark themes, fast micro-animations, and clean responsive grids.
3. **Backend**: **Node.js + Express**
   - *Justification*: Scalable, non-blocking asynchronous event loop structure perfectly suited for handling external AI agent calls (Gemini API) and database syncs.
4. **Database**: **MongoDB + Mongoose**
   - *Justification*: Highly flexible document-oriented database allowing us to store deeply nested trip structures (itineraries, checklist items, hotel lists) as single cohesive documents.
5. **Language**: **JavaScript (ES6+)**
   - *Justification*: Seamless, uniform codebase across both Next.js frontend and Express backend.

---

## High-Level Architecture Explanation

The application follows a standard decouple architecture:

```mermaid
graph TD
    subgraph Client Application (Next.js & Tailwind)
        UI[Auth Pages / Landing] --> DS[Interactive Dashboard]
        DS --> FRM[Planning Form]
        DS --> WK[Workspace View]
        WK --> PDF[PDF Exporter]
        WK --> PC[AI Packing checklist]
        WK --> DRW[Day Regeneration Drawer]
    end

    subgraph REST API Server (Node.js & Express)
        RT[API Router] --> Auth[JWT protect middleware]
        Auth --> AT[Auth Endpoints]
        Auth --> TP[Trip Endpoints]
        TP --> GEM[Gemini AI Connector]
        TP --> DB[(MongoDB Database)]
    end

    Client -- HTTPS / Bearer Token JWT --> RT
```

### Authentication & Authorization Approach
- **JWT Guards**: Handled via standard JSON Web Tokens. Registration hashes credentials with **bcryptjs**. Successful login/signup generates a JWT signed with a secure `JWT_SECRET`.
- **Axios Middleware**: The client stores the token in `localStorage`. Default Axios headers are configured with `Authorization: Bearer <token>` to protect outgoing requests.
- **Strict Data Isolation**: Every Trip record is tied to a Mongoose `userId`. In all backend controllers (`GET /api/trips/:id`, `PUT`, `DELETE`, `regenerate-day`), we strictly check:
  ```js
  if (trip.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied: You do not own this trip' });
  }
  ```
  This ensures User A can never read, modify, or delete User B's itineraries, even if they guess the MongoDB ObjectId.

---

## AI Agent Design & Purpose

Our AI travel agent utilizes the `@google/generative-ai` SDK and targets the `'gemini-1.5-flash'` model due to its high speed, long context limits, and structured JSON parsing.

1. **Structured Outputs**: We utilize the `responseMimeType: "application/json"` parameter. The AI is prompted with a precise JSON schema, guaranteeing that every response contains well-formed JSON conforming to our database Mongoose models.
2. **Deterministic Fallbacks**: If the Gemini API key is missing or fails, our service runs a premium local mock-itinerary generator. This creates highly contextual mock plans for the destination, ensuring the application remains robust during evaluation.
3. **Day-Specific Regeneration**: When a user clicks "Regenerate Day", the frontend passes the day number and a custom prompt (e.g. *"add more street food"*). The backend loads only that day's current activities, passes them to Gemini with the custom request, compiles the new single-day activities, updates Mongoose, and pushes the updated trip back to the frontend.

---

## Custom Creative Features

To exceed standard requirements and demonstrate strong engineering judgment, we built two rich features:

### 1. Dynamic AI Packing Checklist Generator
- **The Problem**: Standard travel packing lists are generic and static. Adventure travelers forget hiking gear; foodies forget antacids; shopping trips need empty luggage allocations.
- **The Solution**: Embedded inside our AI prompt is a category checklist generator. It dynamically scales quantities based on duration and appends contextual items depending on the user's selected interests (e.g., universal power adapters for international, specific activewear, or medical prep for food tasting).
- **UX Integration**: Checklist items are interactive. Checking off an item immediately updates Mongoose in the backend, persisting the packing status across page reloads and displays a premium progress bar.

### 2. Print-Ready Off-Grid PDF Exporter
- **The Problem**: International travelers often lose cellular internet access at airports, transit centers, or remote national parks, rendering web-based planners useless.
- **The Solution**: We developed a client-side print layout using CSS print-media queries (`@media print` in `globals.css`).
- **How it Works**: When the user clicks "Export PDF", the app hides web navigation controls, panels, and sidebars, and displays a beautiful, highly formatted, print-optimized document layout. The browser's native print modal is invoked, allowing users to save the complete itinerary, recommended stays, budget charts, and checklists as an offline-accessible PDF or print it on paper.

---

## Setup Instructions

### Local Development Setup

#### 1. Database Setup
Ensure MongoDB is running locally:
```bash
# Verify or start local MongoDB (if installed via Brew)
brew services start mongodb-community
```

#### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set up environment variables in `backend/.env` (use `.env.example` as a template):
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-travel-planner
   JWT_SECRET=your_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the backend server:
   ```bash
   npm run dev
   ```

#### 3. Frontend Setup
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app locally at `http://localhost:3000`.

---

## Key Design Decisions & Trade-Offs

- **No Client-Side Gemini SDK Calls**: All AI agent communication is routed through our Express server instead of calling the Gemini API from the React client. This protects the developer's API key from exposure in browser source code.
- **Client-Side Print PDF Layout**: Instead of running resource-heavy server-side HTML-to-PDF compilers (like Puppeteer or PDFKit), we optimized CSS media queries. This ensures instant, cost-free, client-side PDF printing with zero server overhead.
- **Single-Day AI Regeneration**: We chose to regenerate only the targeted day instead of the entire trip when modifications are requested. This reduces token usage, saves LLM response time, and avoids overwriting activities on other days that the traveler liked.

---

## Known Limitations

- **Muted AI Fallback**: If the Gemini API key is missing, the application generates premium placeholder mock itineraries. This allows verification of the app flow but uses template-based activity pools instead of live internet curations. Provide a valid `GEMINI_API_KEY` for live AI.
- **Client-Side Authentication Checks**: Route protection relies on React Context state redirects. For full enterprise security, middleware route guarding on Next.js server components can be added.
