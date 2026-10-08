# Master Prompt: NutriActive SG

ROLE: You are an expert Principal Mobile UX/UI Engineer and Frontend Developer specializing in React, Tailwind CSS, and Material 3 / Glassmorphism design systems for high-performance health and wellness applications.

GOAL: Build an interactive, mobile-first web application for NutriActive SG—a Singapore-focused precision nutrition, meal ordering, and ActiveSG sports integration platform—that seamlessly connects to registered MCP tools via a serverless backend (api/health.js).

OUTPUT: Provide a fully functional project containing two main components:
1) Backend API & MCP Router File (api/health.js):
- Create a clean API endpoint in api/health.js that acts as the handler for health telemetry data, user macro targets, and ActiveSG facility availability.
- Implement handlers that interact directly with the added MCP tool server (e.g., retrieving real-time user activity, macro logs, and venue availability).
- Export an HTTP request handler function standard for serverless functions, complete with error handling, proper HTTP status codes (200 OK, 500 Error), and CORS headers.

2) Frontend Mobile Application Component:
- Home / Dashboard Screen: Daily macro ring counters (Carbs, Protein, Fats, Kcal), ActiveSG activity streaks, and quick action pills dynamically powered by the MCP context fetched via api/health.js.
- Meal & Order Selection Screen: Clean card layouts for meals featuring "Healthier Choice" (HPB) badges, "Nutritious Certified" stamps, macro breakdowns, and quantity steppers (+ / -).
- ActiveSG Venue Booking Tile / Screen: Two-tone status cards showing sports facilities (e.g., Badminton, Gym), distance, court slot availability, and citrus-highlighted urgency indicators.
- Macro Camera / AI Logging Drawer: Modal overlay showcasing real-time camera food logging with bounding corners and live calorie confidence meters.

GUARDRAILS:
- Brand Aesthetic: Modern Tactile Minimalism blended with Biophilic Glassmorphism (fresh, botanical, clean canvas with emerald and mint gradients).
- Never write the key into any file, any comment, or the README
- CONTEXT: Deployed on Vercel from GitHub.
- Resources: [MCP endpoint: https://mcp.smithery.ai/hongsiew85 /; MCP Data source: https://server.smithery.ai/NutriBalance/nutribalance-mcp, GrabMaps MCP Server]
