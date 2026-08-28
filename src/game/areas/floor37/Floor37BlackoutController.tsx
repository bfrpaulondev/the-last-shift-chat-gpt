import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'

export function Floor37BlackoutController() {
  const blackoutTriggered = useGameStore((state) => Boolean(state.flags.floor37_blackout_triggered))

  useEffect(() => {
    if (!blackoutTriggered) return

    const state = useGameStore.getState()
    if (state.location.area !== 'floor-37') return
    state.setBlackout(true)

    const timer = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area !== 'floor-37' || latest.areaTransition) return
      latest.requestAreaTransition(
        'blackout',
        'knocked-out',
        { x: 0, y: 1.35, z: 0, yaw: Math.PI },
        1000,
      )
    }, 850)

    return () => window.clearTimeout(timer)
  }, [blackoutTriggered])

  return null
}
