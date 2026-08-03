# Prebunk API

Backend for **Prebunk** — an adaptive media-literacy game that teaches users to
recognize manipulation techniques (false urgency, fake authority, emotional
bait, fake consensus, misleading statistics, AI-generated content cues) in
synthetic, realistic social-media-style messages, rather than asking "true or
false" about real news.

Built for the UNESCO Youth Hackathon 2026.

## Stack

- **FastAPI** — Python web framework, auto-generates interactive docs
- **SQLite** — persistent storage (survives restarts), no separate DB server needed
- **Pydantic** — request/response validation, so the API contract is enforced, not just documented

## Project structure

```
prebunk-backend/
├── app/
│   ├── main.py           # app entry point, wires everything together
│   ├── config.py         # environment-based settings
│   ├── database.py       # SQLite connection + schema
│   ├── content.py        # loads content.json into memory at startup
│   ├── schemas.py         # Pydantic request/response models
│   ├── adaptive.py        # adaptive post-selection logic (isolated, testable)
│   ├── deps.py             # shared helpers (e.g. session validation)
│   └── routers/
│       ├── session.py
│       ├── posts.py
│       ├── answers.py
│       ├── score.py
│       └── health.py
├── tests/
│   └── test_api.py        # automated test suite (pytest)
├── content.json            # the 30-post content library, 6 categories
├── requirements.txt
├── render.yaml              # Render deployment blueprint
├── .env.example
└── prebunk_postman_collection.json   # importable Postman collection
```

## Run locally

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open **http://127.0.0.1:8000/docs** for interactive API docs, or
**http://127.0.0.1:8000/health** to confirm it's alive.

## Run the automated tests

```bash
pytest -v
```

This runs the full contract (session → post → answer → score), edge cases
(invalid session, invalid post, invalid category, missing fields), a
persistence check, and a statistical check on the adaptive logic — 11 tests
in total, all currently passing.

## Test manually with Postman

Import `prebunk_postman_collection.json` into Postman. It's pre-structured
in the correct dependency order and auto-chains variables between requests
(session_id and post_id are captured automatically via test scripts, so you
can just hit **Send** down the list in order). See the collection's folder
structure:

1. **Health** — confirm the server + content are up
2. **Session** — create a session
3. **Game Loop** — get post → submit answer → check score (repeat as needed)
4. **Edge Cases** — invalid session, invalid post, invalid category, malformed body

## API reference

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/session` | Start a new session, returns `session_id` |
| `GET` | `/post/{session_id}` | Get the next post (adaptive selection) |
| `POST` | `/answer` | Submit an answer, get correctness + explanation |
| `GET` | `/score/{session_id}` | Get overall + per-category accuracy |
| `GET` | `/health` | Liveness check |

Full request/response schemas are in `app/schemas.py` and live at `/docs`.

## Deploying

This repo includes `render.yaml`, so deployment is:

1. Push this folder to a GitHub repo
2. On Render: **New → Blueprint** → connect the repo → Render reads
   `render.yaml` automatically and provisions the service
3. Once deployed, your API is live at `https://prebunk-api-xxxx.onrender.com`
4. Update the frontend's API base URL to point there

No manual server configuration needed — `render.yaml` defines the build
command, start command, and health check path.

**Note on the free tier:** Render's free web services spin down after
inactivity and take ~30-50 seconds to wake on the first request. For a live
demo/judging session, hit `/health` a minute or two before presenting to
"warm up" the instance.

## Design notes (for the proposal / judges)

- **Why SQLite, not Postgres, for the hackathon build:** no separate database
  server to provision or pay for, built into Python's standard library, and
  the data model (small per-session tables) doesn't need anything heavier.
  The SQL is intentionally plain so a future migration to Postgres — if this
  ever needs to scale past a single instance — is straightforward.
- **Why the adaptive logic is a simple weighted-random formula, not an ML
  model:** it's fully explainable — anyone can read `adaptive.py` and see
  exactly why a post was chosen. That transparency matters for a media
  literacy tool that's explicitly trying to model "don't trust opaque
  systems, verify how they work."
- **No real news content is ever scraped, stored, or served.** All 30 posts
  in `content.json` are synthetic examples grounded in real, documented
  misinformation *patterns* (see the content library's source notes), not
  copies of real viral claims — this avoids copyright, defamation, and
  misinformation-amplification risk entirely.
