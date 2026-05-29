'use client'


import { useEffect, useState } from 'react'
import { api, type ModelSummary } from '@/lib/api'





export function useModelSummary(windowHours: number, pollMs = 8000) {
  const [data, setData] = useState<ModelSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackedWindow, setTrackedWindow] = useState(windowHours)

  if (windowHours !== trackedWindow) {
    setTrackedWindow(windowHours)
    setData(null)
    setError(null)
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function tick() {
      try {
        const next = await api.intelligence.summary(windowHours)
        if (cancelled) return
        setData(next)
        setError(null)
        setLoading(false)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load telemetry')
        setLoading(false)
      } finally {
        if (!cancelled) timer = setTimeout(tick, pollMs)
      }
    }

    tick()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [windowHours, pollMs])

  return { data, error, loading }
}