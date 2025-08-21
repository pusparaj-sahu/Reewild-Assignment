## Reewild - Foodprint AI Backend + Minimal Frontend

This project implements a small backend API that estimates a dish's carbon footprint using an LLM (OpenAI, optional) and a heuristic fallback. It also exposes a minimal React UI to try the endpoints locally.

### Endpoints

- POST `/api/estimate`
  - Body: `{ "dish": "Chicken Biryani" }`
  - Response: `{ dish, estimated_carbon_kg, ingredients: [{ name, carbon_kg }] }`

- POST `/api/estimate/image`
  - Form-data: `image` (file)
  - Response: same format

Docs available at `/docs` (Swagger UI).

### Getting Started

1. Install deps
   - `npm install`
2. Create `.env` (optional; heuristics will be used if missing):
   - `GEMINI_API_KEY=your_key`
   - `GEMINI_MODEL=gemini-1.5-flash` (optional)
   - `PORT=3000`
3. Run dev servers (Vite + Express):
   - Terminal 1: `npm run dev:server`
   - Terminal 2: `npm run dev`
   - The Vite dev server proxies `/api` and `/docs` to the API.

### Design Notes

- Strongly-typed TypeScript Node server using Express.
- Middleware: CORS, Helmet, rate limiting, logging, centralized error handler.
- AI integration in `backend/services/ai.ts` tries OpenAI first, then falls back to deterministic heuristics for predictable output in offline mode.
- Emission estimation in `backend/services/estimator.ts` uses simple factors (kgCO2e/kg) with fuzzy matching.
- Swagger UI is embedded.

### Production Considerations

- Replace heuristic factors with curated LCA dataset and units normalization.
- Introduce schema validation (e.g., Zod) and typed request/response models.
- Add observability (structured logs, metrics) and more granular rate limits/auth.
- Host in container; add CI, tests, and secrets management.
