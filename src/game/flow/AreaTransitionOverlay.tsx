import { useEffect, useRef } from 'react'
import { useGameStore } from '../state/gameStore'

export function AreaTransitionOverlay() {
  const transition = useGameStore((state) => state.areaTransition)
  const overlay = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = overlay.current
    if (!element || !transition) {
      return
    }

    const animation = element.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.44 },
        { opacity: 1, offset: 0.56 },
        { opacity: 0, offset: 1 },
      ],
      {
        duration: transition.durationMs,
        easing: 'ease-in-out',
        fill: 'forwards',
      },
    )

    return () => animation.cancel()
  }, [transition?.startedAt, transition?.durationMs])

  return (
    <div
      ref={overlay}
      aria-hidden="true"
      data-area-transition={transition ? `${transition.from}->${transition.to}` : 'idle'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: 'none',
        background: '#000',
        opacity: 0,
      }}
    />
  )
}
