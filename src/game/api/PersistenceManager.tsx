import { useEffect, useRef, useState } from 'react'
import {
  checkBackend,
  getPlayerId,
  loadSave,
  postTelemetry,
  saveProgress,
} from './gameApi'
import { useGameStore } from '../state/gameStore'

interface PersistenceManagerProps {
  gameStarted: boolean
}

const TELEMETRY_INTERVAL_MS = 15_000
const MAX_BATCH_SIZE = 500

export function PersistenceManager({ gameStarted }: PersistenceManagerProps) {
  const flags = useGameStore((state) => state.flags)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const [hydrated, setHydrated] = useState(false)
  const playerId = useRef(getPlayerId())
  const gameplayStartedAt = useRef<number | null>(null)
  const flushingTelemetry = useRef(false)

  useEffect(() => {
    let active = true

    const hydrate = async () => {
      const online = await checkBackend()
      if (!active) {
        return
      }

      useGameStore.getState().setBackendOnline(online)

      if (online) {
        const save = await loadSave(playerId.current)
        if (!active) {
          return
        }

        if (save?.flags) {
          useGameStore.getState().hydrateFlags(save.flags)
        }
      }

      setHydrated(true)
    }

    void hydrate()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (gameStarted && gameplayStartedAt.current === null) {
      gameplayStartedAt.current = performance.now()
    }
  }, [gameStarted])

  const getPlaytimeSeconds = () => {
    if (gameplayStartedAt.current === null) {
      return 0
    }

    return Math.max(0, (performance.now() - gameplayStartedAt.current) / 1000)
  }

  useEffect(() => {
    if (!hydrated || !gameStarted || Object.keys(flags).length === 0) {
      return
    }

    let cancelled = false
    const timeout = window.setTimeout(() => {
      void saveProgress(playerId.current, flags, getPlaytimeSeconds()).then((saved) => {
        if (cancelled) {
          return
        }

        const state = useGameStore.getState()
        state.setBackendOnline(saved)
        state.setProgressSaved(saved)
      })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [flags, gameStarted, hydrated])

  useEffect(() => {
    if (!hydrated || !gameStarted) {
      return
    }

    const flushTelemetry = async (keepalive = false) => {
      if (flushingTelemetry.current) {
        return
      }

      const events = useGameStore.getState().telemetry.slice(0, MAX_BATCH_SIZE)
      if (events.length === 0) {
        return
      }

      flushingTelemetry.current = true
      const sent = await postTelemetry(playerId.current, events, keepalive)
      flushingTelemetry.current = false

      if (sent) {
        const state = useGameStore.getState()
        state.acknowledgeTelemetry(events.length)
        state.setBackendOnline(true)
      }
    }

    const interval = window.setInterval(() => {
      void flushTelemetry()
    }, TELEMETRY_INTERVAL_MS)

    const onPageHide = () => {
      void flushTelemetry(true)
    }

    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [gameStarted, hydrated])

  useEffect(() => {
    if (!demoEnded || !hydrated) {
      return
    }

    const persistEnding = async () => {
      const state = useGameStore.getState()
      const events = state.telemetry.slice(0, MAX_BATCH_SIZE)

      if (events.length > 0) {
        const sent = await postTelemetry(playerId.current, events, true)
        if (sent) {
          useGameStore.getState().acknowledgeTelemetry(events.length)
        }
      }

      const latestState = useGameStore.getState()
      const saved = await saveProgress(
        playerId.current,
        latestState.flags,
        getPlaytimeSeconds(),
      )

      latestState.setBackendOnline(saved)
      latestState.setProgressSaved(saved)
    }

    void persistEnding()
  }, [demoEnded, hydrated])

  return null
}
