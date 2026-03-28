# Ghana Constitutional Rights App

A Progressive Web App (PWA) that helps Ghanaians understand their rights under the **1992 Constitution of Ghana**, with support for English, Twi, Ewe, and Ga.

Built for the **Cursor Hackathon**.

---

## Features

- **Crisis Mode** — Instant, offline-capable responses for common legal emergencies (arrest, police search, property disputes, workplace issues). No AI required.
- **AI-Powered Chat** — Ask any question about your constitutional rights. Powered by RAG (FAISS + LLM) over the 1992 Constitution.
- **Multilingual** — English, Twi (Akan), Ewe, and Ga via [Khaya AI](https://ghananlp.org/).
- **PWA / Installable** — Works on any phone without an app store. Add to home screen.
- **Offline First** — Crisis Mode works with zero connectivity. Chat requires internet.

---

## Project Structure

```
ghana-rights/
├── frontend/           # React + TypeScript + Vite PWA
│   ├── src/
│   │   ├── components/ # Chat, CrisisButtons, LanguageSelector, OfflineBanner
│   │   ├── hooks/      # useApi, useOnlineStatus
│   │   ├── types/      # Shared TypeScript interfaces
│   │   └── data/       # Hard-coded crisis responses (offline)
│   └── vite.config.ts  # PWA config with workbox caching
└── backend/            # Python FastAPI
    ├── app/
    │   ├── main.py     # FastAPI app + CORS
    │   ├── routes/     # /api/ask, /api/crisis
    │   ├── services/   # rag.py, khaya.py, llm.py
    │   └── models/     # Pydantic schemas
    └── data/
        ├── constitution.json      # Chunked constitution articles
        ├── crisis_responses.json  # Pre-translated crisis data
        └── faiss_index/           # Generated vector embeddings
```

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- API keys: Khaya AI, Anthropic (Claude) or OpenAI

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # Production PWA build
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your API keys

# Build the FAISS index (run once before demo)
python -m app.services.rag --build

# Start the server
uvicorn app.main:app --reload   # http://localhost:8000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ask` | AI-powered legal query (RAG pipeline) |
| `POST` | `/api/crisis` | Instant hard-coded crisis response |
| `GET`  | `/health` | Health check |

### POST `/api/ask`

```json
{
  "message": "Can police search my bag without a warrant?",
  "language": "en"
}
```

### POST `/api/crisis`

```json
{
  "scenario": "arrested",
  "language": "tw"
}
```

Supported scenarios: `arrested`, `police_stop`, `landlord`, `employer`
Supported languages: `en`, `tw`, `ee`, `ga`

---

## Architecture

```
User → PWA (React)
         ↓
    Khaya AI (translate to English if needed)
         ↓
    FAISS (retrieve top-5 constitutional articles)
         ↓
    LLM: Claude / GPT (generate plain-language explanation)
         ↓
    Khaya AI (translate response back if needed)
         ↓
    User sees answer with cited articles
```

Crisis Mode bypasses all AI — pure JSON lookup, works offline.

---

## Building the FAISS Index

The `data/constitution.json` file contains Chapter 5 articles pre-chunked. To build the vector index:

```bash
cd backend
python -m app.services.rag --build
```

This generates `data/faiss_index/index.faiss` and `data/faiss_index/metadata.json`.

To add more constitutional chapters, append chunks to `constitution.json` and rebuild.

---

## Demo Script (3 min)

1. **Problem** (30s): Most Ghanaians don't know their rights in a crisis.
2. **Crisis Mode** (30s): Tap "I've been arrested" → instant rights with cited articles.
3. **Offline demo** (15s): Airplane mode ON → tap crisis button → still works.
4. **Chat** (30s): Ask "Police took my phone without a warrant" → Article 18 cited.
5. **Twi** (30s): Switch to Twi → same query → response in Twi via Khaya AI.
6. **Install** (15s): "Add to Home Screen" — it's a real app, no app store.
7. **Vision** (20s): Call-a-lawyer, evidence logging, more languages.

---

## Key Constitutional Articles

| Article | Topic |
|---------|-------|
| 14 | Personal liberty, arrest, right to lawyer, 48-hour rule |
| 15 | Human dignity, prohibition of torture |
| 17 | Equality, non-discrimination |
| 18 | Privacy, protection from unreasonable search |
| 19 | Fair trial, presumption of innocence |
| 20 | Protection from property deprivation |
| 21 | Freedom of speech, assembly, movement, association |
| 23 | Administrative justice |
| 24 | Right to work, safe conditions, trade unions |

---

## Disclaimer

This app provides general legal information based on the 1992 Constitution of Ghana.
It is not a substitute for professional legal advice.
For urgent legal matters, contact the **Legal Aid Commission** at `0302-664-951`.