import { useState } from 'react'
import type { AskRequest, AskResponse, CrisisRequest, CrisisResponse } from '../types'

const API_BASE = '/api'

export function useAsk() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ask(request: AskRequest): Promise<AskResponse | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
      return (await res.json()) as AskResponse
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { ask, loading, error }
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
