# Repository Index

## Root
- `backend/` - FastAPI API, RAG data/index build logic, Vercel backend entry.
- `frontend/` - React + TypeScript + Vite PWA app.
- `README.md` - setup, architecture, API overview, run instructions.
- `.gitignore` - excludes secrets, build artifacts, local tooling files.

## Backend (`backend/`)

### Main entry points
- `app/main.py` - FastAPI app setup, CORS, lifespan, router mounting, `/health`.
- `index.py` - Vercel ASGI entry that exports `app` from `app.main`.

### API routes
- `app/routes/ask.py`
- `app/routes/rag_stats.py`
- `app/routes/constitution_pdf.py`
- `app/routes/crisis.py`
- `app/routes/transcribe.py`
- `app/routes/tts.py`
- `app/routes/translate_reply.py`
- `app/routes/translate_text.py`

### Endpoint contract map
All API routers are mounted under `/api` in `app/main.py` (except `/health`).

| Method | Path | Route file | Request model/type | Response model/type | Behavior |
|---|---|---|---|---|---|
| GET | `/health` | `app/main.py` | None | Inline `dict` JSON | Liveness check (`status`, `service`). |
| POST | `/api/ask` | `app/routes/ask.py` | `AskRequest` | `AskResponse` | RAG retrieval + LLM answer, with optional translation flow. |
| GET | `/api/rag/stats` | `app/routes/rag_stats.py` | None | `RagStatsResponse` | Returns RAG/index and retrieval diagnostics. |
| GET | `/api/constitution/pdf` | `app/routes/constitution_pdf.py` | None | `FileResponse` (`application/pdf`) | Streams bundled constitution PDF. |
| POST | `/api/crisis` | `app/routes/crisis.py` | `CrisisRequest` | `CrisisResponse` | Static crisis response lookup by scenario/language. |
| POST | `/api/transcribe` | `app/routes/transcribe.py` | `multipart/form-data` (`audio` file) + query `language` | JSON object (`transcript` or `error`) | Speech-to-text using Khaya ASR endpoint. |
| POST | `/api/tts` | `app/routes/tts.py` | `TtsRequest` | Binary audio `Response` | Text-to-speech using Khaya TTS endpoint. |
| POST | `/api/translate-reply` | `app/routes/translate_reply.py` | `TranslateReplyRequest` | `TranslateReplyResponse` | Re-translates previously generated canonical English reply. |
| POST | `/api/translate-text` | `app/routes/translate_text.py` | `TranslateTextRequest` | `TranslateTextResponse` | Generic source-to-target translation for arbitrary text. |

### Schema-to-endpoint map (`app/models/schemas.py`)
| Schema | Kind | Used by |
|---|---|---|
| `Language` | Enum | `AskRequest`, `CrisisRequest`, `TtsRequest`, `TranslateReplyRequest`, `TranslateTextRequest` |
| `CrisisScenario` | Enum | `CrisisRequest` |
| `AskRequest` | Request | `POST /api/ask` |
| `AskResponse` | Response | `POST /api/ask` |
| `CrisisRequest` | Request | `POST /api/crisis` |
| `CrisisResponse` | Response | `POST /api/crisis` |
| `TtsRequest` | Request | `POST /api/tts` |
| `TranslateReplyRequest` | Request | `POST /api/translate-reply` |
| `TranslateReplyResponse` | Response | `POST /api/translate-reply` |
| `TranslateTextRequest` | Request | `POST /api/translate-text` |
| `TranslateTextResponse` | Response | `POST /api/translate-text` |
| `RagStatsResponse` | Response | `GET /api/rag/stats` |
| `RightItem` | Nested model | Embedded in `CrisisResponse` |
| `EmergencyContact` | Nested model | Embedded in `CrisisResponse` |
| `RagStatsPaths` | Nested model | Embedded in `RagStatsResponse` |
| `RagStatsMtimes` | Nested model | Embedded in `RagStatsResponse` |
| `RagStatsRetrieval` | Nested model | Embedded in `RagStatsResponse` |

### Services
- `app/services/rag.py` - retrieval/index logic and index build CLI.
- `app/services/khaya.py` - Khaya API integration.
- `app/services/llm.py` - LLM provider orchestration.

### Models and schemas
- `app/models/schemas.py` - Pydantic request/response models.

### Data and scripts
- `data/constitution.json` - constitution content chunks for retrieval.
- `data/crisis_responses.json` - crisis response dataset.
- `scripts/ingest_pdf.py` - converts source PDF to ingestion-ready JSON.

### Backend config/tooling
- `requirements.txt` - Python dependencies.
- `.env.example` - backend environment variable template.
- `vercel.json` - backend deployment config + install/build behavior.
- `.vercelignore` - excludes files from Vercel uploads.
- `.python-version` - local/deploy Python version pin.

## Frontend (`frontend/`)

### Main entry points
- `index.html` - Vite HTML shell.
- `src/main.tsx` - React bootstrap and root mount.
- `src/App.tsx` - router, providers, route layout.
- `src/config.ts` - API base URL wiring (`VITE_API_BASE_URL`, default `/api`).

### Route dependency map
All routes render within `RootLayout` from `src/App.tsx`:
- Providers: `LanguageProvider`, `AudioProvider`
- Shared shell: `MainNav`, `OfflineBanner`, `SiteFooter`, `BottomNav`, `LanguageSheet`
- Layout hooks: `useOnlineStatus`, `useMediaQuery`

| Route | Page | Major children | Hooks / Context | API calls |
|---|---|---|---|---|
| `/` | `LandingPage` | `CrisisButtons`, hero illustration | `useOnlineStatus`, `useMediaQuery`, `useLanguage` | None |
| `/learn` | `LearnPage` | `LanguageSelector`, `LearnCategoryCard` | `useMediaQuery`, `useLanguage` | None |
| `/topic/:topicId` | `TopicRoute` -> `TopicPage` | `AudioButton`, `Disclaimer` | `useParams`, `useNavigate`, `useMediaQuery`, `useAudio`, `useLanguage` | TTS via `AudioContext` -> `POST /api/tts` |
| `/ask` | `AskPage` -> `Chat` | `Chat`, then `ChatMessage`, `VoiceInput`, `SuggestedQuestions`, `LanguageSelector`, `Disclaimer` | `useLanguage`, `useOnlineStatus`, `useApi` hooks | `POST /api/ask`, `POST /api/translate-reply`, `POST /api/translate-text` |
| `/crisis` | `CrisisPage` | `LanguageSelector`, `CrisisButtons` | `useLanguage` | None (uses local data) |
| `/about` | `AboutPage` | `Disclaimer` | None | None |

### Reusable component contracts
| Component | Props | Used in |
|---|---|---|
| `Chat` | `language`, `isOnline`, optional `prefillQuestion`, `onPrefillConsumed` | `AskPage` |
| `ChatMessage` | `message`, optional `isOnline`, translation callbacks, `onRetry` | `Chat` |
| `VoiceInput` | `language`, `onTranscript`, optional `disabled` | `Chat` |
| `MainNav` | None | `App` layout |
| `SiteFooter` | None | `App` layout |
| `LanguageSelector` | `language`, `onChange`, optional `variant`, `id`, `labelId` | `MainNav`, `LearnPage`, `CrisisPage`, `Chat`, `SiteFooter`, `LanguageSheet` |
| `CrisisButtons` | `language` | `LandingPage`, `CrisisPage` |
| `SuggestedQuestions` | `questions`, `onSelect`, optional `layout` | `Chat` |
| `Disclaimer` | optional `compact` | `Chat`, `TopicPage`, `AboutPage` |
| `LearnCategoryCard` | `teaser`, `index` | `LearnPage` |
| `TopicPage` | `topic`, `onBack`, `onAskAbout`, `allTopics` | `TopicRoute` |
| `AudioButton` | `id`, `text`, optional `label`, `size`, `speakLanguage` | `TopicPage`, `ChatMessage` |
| `BottomNav` | `onOpenLanguage` | `App` layout |
| `OfflineBanner` | `isOnline` | `App` layout |
| `LanguageSheet` | `onClose` | `App` layout |
| `OboafoLogo` | optional `size`, `showWordmark` | `MainNav`, `SiteFooter` |

### Key source folders
- `src/components/` - shared UI components (chat, nav, voice, footer, etc.).
- `src/pages/` - route-level views (`LandingPage`, `LearnPage`, `TopicRoute`, `AskPage`, `CrisisPage`, `AboutPage`).
- `src/hooks/` - app hooks (`useApi`, `useOnlineStatus`, etc.).
- `src/context/` - global app context providers (`LanguageContext`, `AudioContext`).
- `src/types/` - shared TypeScript app types.
- `src/data/` - frontend data utilities/static response content.

### Frontend config/tooling
- `package.json` - scripts and frontend dependencies.
- `package-lock.json` - exact dependency lockfile.
- `vite.config.ts` - Vite + PWA config, `/api` dev proxy.
- `tsconfig.json` - TypeScript compiler settings (app).
- `tsconfig.node.json` - TypeScript settings for Node-side config files.
- `vercel.json` - static frontend deploy config and SPA rewrites.
- `.env.example` - frontend environment variable template.

## Common local commands
- Frontend dev: `npm run dev` (in `frontend/`)
- Frontend build: `npm run build` (in `frontend/`)
- Frontend preview: `npm run preview` (in `frontend/`)
- Backend install: `pip install -r requirements.txt` (in `backend/`)
- Backend dev server: `uvicorn app.main:app --reload` (in `backend/`)
- Build RAG index: `python -m app.services.rag --build` (in `backend/`)
- Optional PDF ingest: `python scripts/ingest_pdf.py` (in `backend/`)

## Change Impact Map

### Backend impact guide
| If you change... | Likely impact | Minimum verification |
|---|---|---|
| `backend/app/main.py` | App startup, middleware, router wiring, health endpoint | Check `/health`; smoke test every `/api/*` route mount. |
| `backend/app/routes/ask.py` | Core Q&A flow, language handling, response shape consumed by chat UI | Call `POST /api/ask` with EN + local language payloads; verify answer, steps, disclaimer fields. |
| `backend/app/routes/translate_reply.py` | Post-answer translation in chat history | Call `POST /api/translate-reply`; verify translated answer/steps/disclaimer and fallback behavior. |
| `backend/app/routes/translate_text.py` | User message translation before ask flow | Call `POST /api/translate-text`; verify empty text and same-language short-circuit paths. |
| `backend/app/routes/tts.py` | Audio playback for topic/chat messages | Call `POST /api/tts`; verify audio response headers/body and no-key error path. |
| `backend/app/routes/transcribe.py` | Voice input transcription from frontend microphone uploads | Upload a WAV sample to `POST /api/transcribe`; verify transcript/error contract. |
| `backend/app/routes/crisis.py` or `backend/data/crisis_responses.json` | Crisis scenario content and language fallback | Call `POST /api/crisis` for each scenario + language fallback to EN. |
| `backend/app/services/rag.py` | Retrieval quality, indexing, startup warmup and diagnostics | Run `python -m app.services.rag --build`; call `/api/rag/stats`; ask retrieval-heavy questions. |
| `backend/app/services/llm.py` | Model/provider selection, answer generation behavior | Call `POST /api/ask`; compare output shape and response quality under configured provider. |
| `backend/app/services/khaya.py` | Translation/TTS/ASR integration for all language/audio flows | Verify `translate-text`, `translate-reply`, `tts`, `transcribe` end-to-end. |
| `backend/app/models/schemas.py` | Validation contracts shared across routes and frontend type assumptions | Re-test all route payload validations and frontend parsing in `/ask`. |
| `backend/vercel.json` or `backend/index.py` | Deployment behavior, serverless entry, rewrites, build-time index creation | Deploy preview; verify `/api/*` endpoints and cold-start index availability. |

### Frontend impact guide
| If you change... | Likely impact | Minimum verification |
|---|---|---|
| `frontend/src/App.tsx` | Routing, global layout, providers, nav/footer visibility | Visit all routes (`/`, `/learn`, `/topic/:id`, `/ask`, `/crisis`, `/about`) on mobile + desktop width. |
| `frontend/src/pages/AskPage.tsx` or `frontend/src/components/Chat.tsx` | Core ask experience, message lifecycle, retries, language interactions | Full ask flow: submit typed question, retry, translation toggles, suggested prompts, offline banner behavior. |
| `frontend/src/components/ChatMessage.tsx` | Rendering of assistant/user messages and translation controls | Validate message formatting and re-translate actions on existing messages. |
| `frontend/src/components/VoiceInput.tsx` | Microphone UX and transcript insertion | Record voice note; ensure transcript appears and submit succeeds. |
| `frontend/src/context/AudioContext.tsx` or `frontend/src/components/AudioButton.tsx` | In-app speech playback from text | Trigger TTS in topic and chat contexts; verify play/pause and error fallback. |
| `frontend/src/context/LanguageContext.tsx` or `frontend/src/components/LanguageSelector.tsx` | Global language selection and propagation | Switch language in nav/footer/chat; verify all connected pages update consistently. |
| `frontend/src/hooks/useApi.ts` | All backend API calls and client-side error handling | Smoke test `ask`, `translate-reply`, `translate-text`, and any enabled crisis hook usage. |
| `frontend/src/pages/LandingPage.tsx`, `LearnPage.tsx`, `TopicRoute.tsx`, `CrisisPage.tsx`, `AboutPage.tsx` | Route-specific content and CTA navigation | Validate each page render and key CTA links/navigation targets. |
| `frontend/src/types/index.ts` | Shared typings across chat/pages/hooks | Run typecheck/build and validate major typed flows compile cleanly. |
| `frontend/vite.config.ts` or `frontend/src/config.ts` | API base URL/proxy behavior, PWA build/runtime config | Run `npm run dev` and `npm run build`; confirm `/api` requests route correctly. |

### Cross-cutting flows to always smoke test
- Ask flow: user question -> optional input translation -> `/api/ask` -> response render -> optional re-translation.
- Voice flow: microphone capture -> `/api/transcribe` -> text insertion -> ask submission.
- Audio playback flow: message/topic text -> `/api/tts` -> browser playback controls.
- Crisis flow: landing/crisis pages scenario selection + language switching + static content rendering.
- Connectivity flow: offline UI banners/states and recover behavior once online.

### Lightweight regression checklist
- Backend starts without import/runtime errors (`uvicorn app.main:app --reload`).
- Frontend dev server runs and routes load (`npm run dev` in `frontend/`).
- One successful request per critical endpoint: `ask`, `translate-text`, `translate-reply`, `tts`, `transcribe`, `crisis`, `rag/stats`.
- Frontend production build passes (`npm run build` in `frontend/`).
- No obvious console/runtime errors in `/ask`, `/topic/:topicId`, and `/crisis`.

## Notes
- The repository is split into two independent apps (`backend/` and `frontend/`), each with its own deployment config.
- Generated vector index files under `backend/data/faiss_index/` are expected to be build artifacts.
- Frontend has an implemented `useCrisis()` API hook, but route UI currently serves crisis content from local/static data.
