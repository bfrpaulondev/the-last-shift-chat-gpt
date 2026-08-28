import { useEffect, useRef, useState } from 'react'

const START_MINUTES = 320
const SECONDS_PER_MINUTE = 10

function formatTime(totalMinutes: number): string {
  const normalized = totalMinutes % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function GameClock() {
  const startedAt = useRef(performance.now())
  const [time, setTime] = useState('05:20')

  useEffect(() => {
    const update = () => {
      const elapsedSeconds = (performance.now() - startedAt.current) / 1000
      const gameMinutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE)
      setTime(formatTime(START_MINUTES + gameMinutes))
    }

    const timer = window.setInterval(update, 250)
    return () => window.clearInterval(timer)
  }, [])

  return <div className="game-clock">{time}</div>
}
