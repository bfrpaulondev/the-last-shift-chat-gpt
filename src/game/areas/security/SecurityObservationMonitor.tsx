import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

type ObservationPhase = 'off' | 'figure' | 'static'

function makeFigureTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#11171b')
  gradient.addColorStop(1, '#050708')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#22292d'
  context.fillRect(95, 0, 26, canvas.height)
  context.fillRect(canvas.width - 118, 0, 28, canvas.height)
  context.fillStyle = '#0b0e10'
  context.fillRect(130, 64, canvas.width - 260, 250)

  context.save()
  context.translate(330, 226)
  context.rotate(-0.055)
  context.fillStyle = '#020303'
  context.beginPath()
  context.ellipse(0, 13, 46, 105, 0, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.moveTo(-58, -49)
  context.quadraticCurveTo(0, -118, 58, -49)
  context.lineTo(34, 10)
  context.lineTo(-34, 10)
  context.closePath()
  context.fill()
  context.restore()

  context.fillStyle = 'rgba(186, 221, 211, 0.72)'
  context.font = '600 18px ui-monospace, monospace'
  context.fillText('CAM 09 — CORREDOR CENTRAL', 18, 28)
  context.fillText('00:05:--', canvas.width - 120, 28)

  for (let y = 0; y < canvas.height; y += 6) {
    context.fillStyle = 'rgba(180, 220, 205, 0.035)'
    context.fillRect(0, y, canvas.width, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function makeStaticTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 180
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)
  const image = context.createImageData(canvas.width, canvas.height)
  for (let index = 0; index < image.data.length; index += 4) {
    const value = 28 + Math.floor(Math.random() * 150)
    image.data[index] = value
    image.data[index + 1] = value + 7
    image.data[index + 2] = value + 4
    image.data[index + 3] = 255
  }
  context.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function SecurityObservationMonitor() {
  const camClosed = useGameStore((state) => Boolean(state.flags.cam02_view_closed))
  const observed = useGameStore((state) => Boolean(state.flags.observed_first))
  const [phase, setPhase] = useState<ObservationPhase>('off')
  const figureTexture = useMemo(() => makeFigureTexture(), [])
  const staticTexture = useMemo(() => makeStaticTexture(), [])

  useEffect(() => () => {
    figureTexture.dispose()
    staticTexture.dispose()
  }, [figureTexture, staticTexture])

  useEffect(() => {
    if (!camClosed || observed) return

    const start = window.setTimeout(() => {
      const game = useGameStore.getState()
      if (game.location.area !== 'security-center' || game.flags.observed_first) return
      setPhase('figure')
      game.adjustBpm(25)
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'security:observation-1-figure',
        wasFirstTime: true,
      })
      window.dispatchEvent(new Event('security:observation-sting'))
    }, 650)

    const cut = window.setTimeout(() => {
      if (useGameStore.getState().location.area === 'security-center') setPhase('static')
    }, 1650)

    const finish = window.setTimeout(() => {
      const game = useGameStore.getState()
      if (game.location.area !== 'security-center') return
      setPhase('off')
      game.setFlag('observed_first')
      game.setCheckpoint('security-observation-seen', game.location.spawn)
    }, 2250)

    return () => {
      window.clearTimeout(start)
      window.clearTimeout(cut)
      window.clearTimeout(finish)
    }
  }, [camClosed, observed])

  return (
    <group position={[1.58, 1.82, -6.16]}>
      <mesh castShadow>
        <boxGeometry args={[1.38, 0.88, 0.1]} />
        <meshStandardMaterial color="#20262a" roughness={0.42} metalness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.058]}>
        <planeGeometry args={[1.2, 0.675]} />
        {phase === 'off' ? (
          <meshStandardMaterial color="#050708" emissive="#030506" emissiveIntensity={0.06} roughness={0.25} />
        ) : (
          <meshBasicMaterial
            map={phase === 'figure' ? figureTexture : staticTexture}
            toneMapped={false}
          />
        )}
      </mesh>
    </group>
  )
}
