# Prebunk — Frontend (React + Vite)

An interactive, depth-rich frontend for the Prebunk media-literacy game. Talks to the
FastAPI backend (`../backend`) through its REST API. Keeps the refined, minimal,
editorial look — but adds real **mouse-driven depth and feel**.

## What makes it feel alive

- **Cursor-following glow + dot** — a soft radial light tracks your cursor around the
  page (slightly lagged, like a real light source), plus a tiny accent dot.
- **3D tilt** on the post card and the six technique cards — they rotate and shift in
  perspective toward your cursor, with layered depth (`transform: translateZ`).
- **Magnetic buttons** — CTAs are gently pulled toward your cursor on hover and spring
  back on leave.
- **Animated screen transitions** between Landing / Play / Results via Framer Motion,
  plus staggered reveals, springy score pop, and animated per-technique bars.
- **Top progress hairline** fills as you advance, and a drifting ✦ pointer hint on the
  landing page.

## Run it

1. Start the backend:
   ```bash
   cd ../backend
   source venv/bin/activate   # or venv\Scripts\activate on Windows
   uvicorn app.main:app --reload --port 8000
   ```
2. Install and run the frontend:
   ```bash
   cd prebunk-frontend-react
   npm install
   npm run dev
   ```
3. Open the dev URL (Vite prints it — usually `http://localhost:5173`). On the landing
   page the **Backend URL** should be `http://127.0.0.1:8000`; the status dot turns green
   when connected.

> Note: the backend CORS defaults to `*`, so the frontend works from any port/host.

## Structure

```
src/
├── App.jsx            # state machine: landing → play → results, view transitions
├── api.js             # wrapper for /health /session /post /answer /score
├── data.js            # technique metadata + formatting helpers
├── hooks.jsx          # useMousePos, useLerpedMouse, useTilt + <Tilt> component
├── styles.css         # minimal editorial theme + all depth/interaction styles
├── components/
│   ├── CursorGlow.jsx # moving background light + cursor dot
│   └── Magnetic.jsx   # cursor-attracted button
└── views/
    ├── Landing.jsx    # hero, parallax technique cards, settings, health check
    ├── Play.jsx       # tilting post card + animated options + feedback
    └── Results.jsx    # big score + animated per-technique bars
```

## Easy next steps

- Add a pre-round **"technique primer"** screen in the same style.
- Confetti burst on the results screen when accuracy ≥ 80%.
- Persist the `session_id` in `localStorage` so a reload keeps the round.
- Add a shareable result card ("I scored 90% on Prebunk.").
- Swap the serif system font for a loaded web font (Fraunces / Newsreader) for a
  more distinctive headline — via a local font file so it still works offline.
