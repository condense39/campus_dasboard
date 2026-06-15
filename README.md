# Campus Intelligence Dashboard — IIT Roorkee

The Campus Intelligence Dashboard is an AI-powered student portal designed for IIT Roorkee. It provides students with a beautifully designed, centralized interface to seamlessly manage their academic courses, track their club events, and view cafeteria menus. It also features a fully integrated Gemini AI search assistant capable of answering complex campus queries by intelligently parsing local datasets and generating tabular results.

LINK: https://campus-dashboard123.vercel.app

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14 (App Router)** | Core framework, Server Components, and Serverless API routes |
| **Gemini 2.5 Flash** | AI Engine powering the semantic campus search and data extraction |
| **NextAuth.js** | Secure authentication handling (Google OAuth + Email OTP) |
| **MongoDB Atlas** | Cloud database storing user profiles and all campus data (library, cafeteria, events, courses) |
| **Tailwind CSS** | Utility-first styling for a clean, green-themed responsive UI |

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and populate it with the necessary keys (see the Environment Variables table below).

4. **Seed the MongoDB Database**
   Campus data (library books, cafeteria menus, events, academics) must be seeded into your MongoDB Atlas database before running the app.
   ```bash
   node scripts/seed-mongodb.js
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Architecture Workflow

1. **Data Management**: All campus data (events, courses, cafeteria items, library books) is stored in MongoDB. The `seed-mongodb.js` script handles initial population from local JSON files.
2. **MCP Routing**: The application exposes internal API routes (`/api/mcp/...`) that query MongoDB in real-time to return structured campus data.
3. **AI Search (Gemini)**: When a student executes a search query, the backend intercepts keywords to fetch the most relevant data from the MCP routes. This live data is injected into the prompt context for **Gemini 2.5 Flash**, which then processes the query and returns a structured JSON layout.
4. **UI Render**: The frontend parses the structured JSON and dynamically renders a styled HTML table on the Search page. 
5. **User Personalization**: A student's branch, semester, clubs, and favourite dishes are used intelligently by the backend to fetch highly personalized search results.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/campus-dashboard?retryWrites=true&w=majority`) |
| `GEMINI_API_KEY` | Google Generative AI API key for the Search endpoint |
| `NEXTAUTH_SECRET` | Secret hash used by NextAuth to encrypt JWT tokens |
| `NEXTAUTH_URL` | The base URL of the deployed application (e.g., `http://localhost:3000` or production URL) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for sign-in integration |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GMAIL_USER` | Gmail address used by Nodemailer to dispatch Email OTPs |
| `GMAIL_APP_PASSWORD` | App-specific password generated via Google Account Security for SMTP |
