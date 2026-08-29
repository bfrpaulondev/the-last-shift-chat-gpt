import { useFBO } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const MONITOR_POSITION: [number, number, number] = [-1.18, 1.82, -6.16]
const TAP_THRESHOLD_MS = 320
const WORLD_FEED_FPS = 12

function makeOverlayTexture(zoomed: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 576
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = 'rgba(126, 255, 177, 0.18)'
  context.lineWidth = 1
  for (let y = 0; y < canvas.height; y += 8) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(canvas.width, y)
    context.stroke()
  }

  context.fillStyle = 'rgba(166, 255, 196, 0.92)'
  context.font = '700 28px ui-monospace, monospace'
  context.textAlign = 'left'
  context.fillText('CAM 02 — LOBBY', 28, 44)
  context.textAlign = 'right'
  context.fillText('23:52:07', canvas.width - 28, 44)

  context.font = '600 22px ui-monospace, monospace'
  context.textAlign = 'left'
  context.fillStyle = 'rgba(166, 255, 196, 0.72)'
  context.fillText(zoomed ? 'DIGITAL ZOOM ×2.4' : 'REC ●', 28, canvas.height - 30)
  context.textAlign = 'right'
  context.fillText('[E] toque: fechar · segure: zoom', canvas.width - 28, canvas.height - 30)

  if (zoomed) {
    context.strokeStyle = 'rgba(166, 255, 196, 0.5)'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(canvas.width / 2 - 40, canvas.height / 2)
    context.lineTo(canvas.width / 2 + 40, canvas.height / 2)
    context.moveTo(canvas.width / 2, canvas.height / 2 - 40)
    context.lineTo(canvas.width / 2, canvas.height / 2 + 40)
    context.stroke()
    context.fillStyle = 'rgba(166, 255, 196, 0.78)'
    context.textAlign = 'center'
    context.fillText('MOVIMENTO RESPIRATÓRIO: 0', canvas.width / 2, canvas.height - 72)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function LobbyFeedWorld() {
  return (
    <>
      <color attach="background" args={['#080b0d']} />
      <ambientLight intensity={0.18} color="#8797a0" />
      <directionalLight position={[1.5, 5, 2]} intensity={0.7} color="#afc4cc" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 9]} />
        <meshStandardMaterial color="#373b3d" roughness={0.32} metalness={0.16} />
      </mesh>

      <mesh castShadow position={[0, 0.63, -0.45]}>
        <boxGeometry args={[4.4, 1.25, 1.05]} />
        <meshStandardMaterial color="#292d30" roughness={0.54} metalness={0.2} />
      </mesh>

      <group name="nascimento-static-body" position={[0.72, 0, -1.18]} rotation={[0.08, -0.22, 0]}>
        <mesh castShadow position={[0, 0.66, 0]} rotation={[0.03, 0, -0.16]}>
          <capsuleGeometry args={[0.22, 0.65, 6, 10]} />
          <meshStandardMaterial color="#232a2d" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.08, 1.2, 0.02]}>
          <sphereGeometry args={[0.19, 16, 12]} />
          <meshStandardMaterial color="#7d5d4e" roughness={0.78} />
        </mesh>
        <mesh castShadow position={[-0.22, 0.55, 0.16]} rotation={[0.15, 0.18, 0.2]}>
          <capsuleGeometry args={[0.06, 0.46, 5, 8]} />
          <meshStandardMaterial color="#7d5d4e" roughness={0.78} />
        </mesh>
      </group>

      <mesh castShadow position={[1.14, 0.07, -0.8]} rotation={[0, -0.35, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.07, 0.44, 10]} />
        <meshStandardMaterial color="#161b1e" roughness={0.45} metalness={0.38} />
      </mesh>

      <mesh castShadow position={[0.38, 1.31, -0.16]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <boxGeometry args={[0.42, 0.58, 0.025]} />
        <meshStandardMaterial color="#d0c6a9" roughness={0.88} />
      </mesh>
    </>
  )
}

export function SecurityCameraFeed() {
  const { camera, gl } = useThree()
  const target = useFBO(512, 288, {
    depthBuffer: true,
    stencilBuffer: false,
    samples: 0,
  })
  const feedScene = useMemo(() => new THREE.Scene(), [])
  const feedCamera = useMemo(() => {
    const next = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 30)
    next.position.set(0.2, 5.8, 4.6)
    next.lookAt(0.35, 0.72, -0.75)
    next.updateProjectionMatrix()
    return next
  }, [])
  const focusGroup = useRef<THREE.Group>(null)
  const active = useRef(false)
  const eDownAt = useRef<number | null>(null)
  const lastWorldRender = useRef(0)
  const firstOpen = useRef(false)
  const [focusVisible, setFocusVisible] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const overlayTexture = useMemo(() => makeOverlayTexture(zoomed), [zoomed])

  useEffect(() => () => overlayTexture.dispose(), [overlayTexture])

  useEffect(() => {
    const closeFeed = () => {
      if (!active.current) return
      active.current = false
      eDownAt.current = null
      setZoomed(false)
      setFocusVisible(false)
      const game = useGameStore.getState()
      const wasFirst = !game.flags.cam02_viewed
      game.setFlag('cam02_viewed')
      game.setFlag('cam02_view_closed')
      game.setCheckpoint('security-cam02-reviewed', game.location.spawn)
      game.setCinematic(false)
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'security:cam02-close',
        wasFirstTime: wasFirst,
      })
    }

    const openFeed = () => {
      if (active.current) return
      active.current = true
      setFocusVisible(true)
      const game = useGameStore.getState()
      game.setCinematic(true)
      game.setFlag('clock_mismatch')
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'security:cam02-open',
        wasFirstTime: !firstOpen.current,
      })
      if (!firstOpen.current) {
        firstOpen.current = true
        window.setTimeout(() => {
          if (active.current) useGameStore.getState().say('Cinco minutos. Quem tá mentindo?')
        }, 420)
      }
    }

    const onOpen = () => openFeed()
    const onKeyDown = (event: KeyboardEvent) => {
      if (!active.current) return
      if (event.code === 'Escape') {
        event.preventDefault()
        closeFeed()
        return
      }
      if (event.code === 'KeyE' && !event.repeat) eDownAt.current = performance.now()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (!active.current || event.code !== 'KeyE' || eDownAt.current === null) return
      const heldFor = performance.now() - eDownAt.current
      eDownAt.current = null
      if (heldFor < TAP_THRESHOLD_MS) {
        closeFeed()
      } else {
        setZoomed(false)
      }
    }

    window.addEventListener('security:cam02-open', onOpen)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('security:cam02-open', onOpen)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (active.current) useGameStore.getState().setCinematic(false)
    }
  }, [])

  useFrame(() => {
    if (eDownAt.current !== null && active.current && !zoomed) {
      const heldFor = performance.now() - eDownAt.current
      if (heldFor >= TAP_THRESHOLD_MS) {
        setZoomed(true)
        const game = useGameStore.getState()
        if (!game.flags.cam02_zoomed_nascimento) {
          game.setFlag('cam02_zoomed_nascimento')
          game.logEvent({
            t: performance.now() / 1000,
            type: 'interact',
            objectId: 'security:cam02-zoom-nascimento',
            wasFirstTime: true,
          })
        }
      }
    }

    feedCamera.fov = THREE.MathUtils.damp(feedCamera.fov, zoomed ? 27 : 55, 9, 1 / 60)
    feedCamera.lookAt(zoomed ? 0.72 : 0.35, zoomed ? 0.8 : 0.72, zoomed ? -1.1 : -0.75)
    feedCamera.updateProjectionMatrix()

    const now = performance.now()
    const interval = active.current ? 1000 / 30 : 1000 / WORLD_FEED_FPS
    if (now - lastWorldRender.current >= interval) {
      lastWorldRender.current = now
      const previousTarget = gl.getRenderTarget()
      const previousAutoClear = gl.autoClear
      gl.setRenderTarget(target)
      gl.autoClear = true
      gl.clear(true, true, true)
      gl.render(feedScene, feedCamera)
      gl.setRenderTarget(previousTarget)
      gl.autoClear = previousAutoClear
    }

    if (focusVisible && focusGroup.current) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
      focusGroup.current.position.copy(camera.position).addScaledVector(forward, 0.62)
      focusGroup.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <>
      {createPortal(<LobbyFeedWorld />, feedScene)}

      <group position={MONITOR_POSITION} userData={{ securityInteractableId: 'cam02' }}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.38, 0.88, 0.1]} />
          <meshStandardMaterial color="#20262a" roughness={0.42} metalness={0.48} />
        </mesh>
        <mesh position={[0, 0, 0.058]}>
          <planeGeometry args={[1.2, 0.675]} />
          <meshBasicMaterial map={target.texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[1.2, 0.675]} />
          <meshBasicMaterial map={overlayTexture} transparent opacity={0.62} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {focusVisible && (
        <group ref={focusGroup} raycast={() => null}>
          <mesh renderOrder={40}>
            <planeGeometry args={[0.92, 0.518]} />
            <meshBasicMaterial map={target.texture} depthTest={false} toneMapped={false} />
          </mesh>
          <mesh renderOrder={41} position={[0, 0, 0.002]}>
            <planeGeometry args={[0.92, 0.518]} />
            <meshBasicMaterial map={overlayTexture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  )
}
