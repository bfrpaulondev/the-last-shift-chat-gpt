import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useBusTriageStore } from './busTriageStore'

export function BusRideMotion() {
  const { camera } = useThree()
  const lastPulse = useRef(useBusTriageStore.getState().bumpPulse)
  const bumpStartedAt = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      camera.rotation.z = 0
    }
  }, [camera])

  useFrame(({ clock }, delta) => {
    const pulse = useBusTriageStore.getState().bumpPulse
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse
      bumpStartedAt.current = performance.now()
    }

    let bumpRoll = 0
    if (bumpStartedAt.current !== null) {
      const progress = (performance.now() - bumpStartedAt.current) / 520
      if (progress < 1) {
        bumpRoll = Math.sin(progress * Math.PI * 2.4) * (1 - progress) * 0.018
      } else {
        bumpStartedAt.current = null
      }
    }

    const roadRoll = Math.sin(clock.elapsedTime * 1.15) * 0.0028
    camera.rotation.z = THREE.MathUtils.damp(
      camera.rotation.z,
      roadRoll + bumpRoll,
      12,
      Math.min(delta, 0.05),
    )
  })

  return null
}
