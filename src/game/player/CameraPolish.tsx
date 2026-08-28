import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraPolishProps {
  enabled: boolean
}

const DEFAULT_FOV = 70
const INSPECTION_FOV = 35
const FOV_DAMPING = 10

export function CameraPolish({ enabled }: CameraPolishProps) {
  const { camera, gl } = useThree()
  const zoomHeld = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const releaseZoom = () => {
      zoomHeld.current = false
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 2 && enabled) {
        zoomHeld.current = true
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.button === 2) {
        releaseZoom()
      }
    }

    const onContextMenu = (event: MouseEvent) => {
      if (enabled) {
        event.preventDefault()
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('blur', releaseZoom)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', releaseZoom)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [enabled, gl])

  useEffect(() => {
    if (!enabled) {
      zoomHeld.current = false
    }
  }, [enabled])

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return
    }

    const targetFov = enabled && zoomHeld.current ? INSPECTION_FOV : DEFAULT_FOV
    const nextFov = THREE.MathUtils.damp(
      camera.fov,
      targetFov,
      FOV_DAMPING,
      Math.min(delta, 0.05),
    )

    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
