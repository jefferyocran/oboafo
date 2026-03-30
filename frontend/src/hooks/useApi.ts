import { useState } from 'react'
import { API_BASE } from '../config'
import type {
  AskRequest,
  AskResponse,
  AskResult,
  CrisisRequest,
  CrisisResponse,
  TranslateReplyRequest,
  TranslateReplyResponse,
  TranslateTextRequest,
  TranslateTextResponse,
} from '../types'

function truncateMessage(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function friendlyAskError(status: number, detail: string): string {
  const d = detail.trim()
  if (status === 429) {
    return 'Too many requests right now. Please wait a few seconds and try again.'
  }
  if (status === 401 || status === 403) {
    return 'The service could not authorize this request. Check API keys on the server.'
  }
  if (status === 502) {
    return 'Translation step failed (Khaya). Try switching to English or try again shortly.'
  }
  if (status === 503) {
    return 'The service is temporarily busy. Please try again in a moment.'
  }
  if (status >= 500) {
    return d
      ? `Server error (${status}): ${truncateMessage(d, 220)}`
      : `Something went wrong on the server (${status}). Please try again.`
  }
  if (status === 422) {
    return 'Invalid request. Refresh the page or shorten your question.'
  }
  return d || `Request failed (${status}).`
}

/**
 * POST /api/ask — safe for concurrent use (no shared React loading flag).
 */
export async function askRequest(request: AskRequest): Promise<AskResult> {
  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    const raw = await res.text()
    if (!res.ok) {
      let detail = raw
      try {
        const j = JSON.parse(raw) as { detail?: unknown }
        if (j?.detail != null) {
          detail =
            typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail)
        }
      } catch {
        /* use raw body */
      }
      return {
        ok: false,
        error: friendlyAskError(res.status, detail),
        status: res.status,
      }
    }
    try {
      const data = JSON.parse(raw) as AskResponse
      return { ok: true, data }
    } catch {
      return {
        ok: false,
        error: 'Invalid response from server. Please try again.',
        status: res.status,
      }
    }
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Network error: ${e.message}`
          : 'Network error — check your connection.',
    }
  }
}

export function useAsk() {
  const [inFlight, setInFlight] = useState(0)

  async function ask(request: AskRequest): Promise<AskResult> {
    setInFlight((n) => n + 1)
    try {
      return await askRequest(request)
    } finally {
      setInFlight((n) => Math.max(0, n - 1))
    }
  }

  return { ask, inFlight }
}

export async function translateReply(
  body: TranslateReplyRequest,
): Promise<TranslateReplyResponse> {
  const res = await fetch(`${API_BASE}/translate-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(
      res.status === 502
        ? 'Translation service unavailable. Try switching to English.'
        : `Translation failed (${res.status}).`,
    )
  }
  return (await res.json()) as TranslateReplyResponse
}

export async function translateText(
  body: TranslateTextRequest,
): Promise<TranslateTextResponse> {
  const res = await fetch(`${API_BASE}/translate-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: body.text, source: body.source, target: body.target }),
  })
  if (!res.ok) {
    throw new Error(
      res.status === 502
        ? 'Translation service unavailable. Try switching to English.'
        : `Translation failed (${res.status}).`,
    )
  }
  return (await res.json()) as TranslateTextResponse
}

export function useCrisis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchCrisis(request: CrisisRequest): Promise<CrisisResponse | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/crisis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
      return (await res.json()) as CrisisResponse
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { fetchCrisis, loading, error }
}
