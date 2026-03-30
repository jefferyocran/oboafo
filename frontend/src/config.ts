/**
 * Backend API base path, always including the `/api` prefix used by FastAPI routers.
 * - Dev: `/api` (Vite proxies to the local backend).
 * - Production: set `VITE_API_BASE_URL` on the Vercel frontend project, e.g. `https://your-api.vercel.app/api`.
 */
function normalizeApiBase(raw: string | undefined): string {
  const s = (raw ?? '').trim().replace(/\/$/, '')
  return s || '/api'
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
