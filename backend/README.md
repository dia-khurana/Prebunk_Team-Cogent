# Prebunk Backend

Backend API for **Prebunk**, an adaptive media literacy platform developed for the **UNESCO Youth Hackathon 2026**.

Instead of fact-checking real news, Prebunk trains users to identify common manipulation techniques through realistic, AI-generated social media scenarios. The platform focuses on recognizing patterns such as:

* False urgency
* Fake authority
* Emotional manipulation
* False consensus
* Misleading statistics
* AI-generated content indicators

The backend provides session management, adaptive content delivery, answer evaluation, progress tracking, and persistent storage through a RESTful API.

---

## Tech Stack

* **FastAPI** — High-performance Python web framework
* **SQLite** — Lightweight persistent database
* **Pydantic** — Data validation and request/response schemas
* **Pytest** — Automated API testing

---

## Project Structure

```text
prebunk-backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── content.py
│   ├── schemas.py
│   ├── adaptive.py
│   ├── deps.py
│   └── routers/
│       ├── session.py
│       ├── posts.py
│       ├── answers.py
│       ├── score.py
│       └── health.py
├── tests/
│   └── test_api.py
├── content.json
├── requirements.txt
├── render.yaml
├── .env.example
└── prebunk_postman_collection.json
```

---

## Features

* Session-based gameplay
* Adaptive question selection
* Manipulation technique detection
* Immediate feedback with explanations
* Category-wise performance tracking
* Persistent SQLite storage
* Interactive OpenAPI documentation
* Automated API test suite
* Ready-to-deploy Render configuration

---

## Installation

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## API Documentation

After starting the server:

* Swagger UI: `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/health`

---

## API Endpoints

| Method | Endpoint              | Description                                          |
| ------ | --------------------- | ---------------------------------------------------- |
| POST   | `/session`            | Create a new game session                            |
| GET    | `/post/{session_id}`  | Retrieve the next adaptive post                      |
| POST   | `/answer`             | Submit an answer and receive feedback                |
| GET    | `/score/{session_id}` | Retrieve session score and category-wise performance |
| GET    | `/health`             | Service health check                                 |

---

## Testing

Run the complete test suite using:

```bash
pytest -v
```

The test suite validates:

* Session creation
* Adaptive content retrieval
* Answer submission
* Score calculation
* Input validation
* Persistence
* Error handling

---

## Postman Collection

Import `prebunk_postman_collection.json` into Postman to test the complete API workflow.

The collection includes:

* Health Check
* Session Creation
* Gameplay Flow
* Score Retrieval
* Edge Case Validation

---

## Deployment

The project includes a `render.yaml` configuration for one-click deployment on Render.

```text
1. Push the repository to GitHub
2. Create a new Blueprint service on Render
3. Connect the repository
4. Deploy
```

---

## Architecture

The backend follows a modular architecture with clear separation of concerns:

* **Routers** handle API endpoints
* **Schemas** define request and response contracts
* **Adaptive Engine** determines personalized content selection
* **Database Layer** manages persistent storage
* **Content Loader** initializes the synthetic content library

This structure keeps the codebase maintainable, testable, and easy to extend.

---

## Design Principles

* Uses fully synthetic content to avoid misinformation amplification.
* Adaptive content selection is deterministic and explainable rather than model-driven.
* Modular architecture designed for future database and deployment scalability.
