import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

export function WristBpmReadout() {
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const handAction = useGameStore((state) => state.handAction)
  const active = handAction?.objectId === 'wrist-pulse'
  const sampledBpm = active ? Math.round(useGameStore.getState().bpm) : 0

  const texture = useMemo(() => {
    if (!active) return null
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const context = canvas.getContext('2d')
    if (!context) return null
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(4, 12, 8, 0.88)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(115, 255, 168, 0.82)'
    context.lineWidth = 3
    context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6)
    context.fillStyle = '#9dffbc'
    context.font = '700 40px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(`${sampledBpm} BPM`, canvas.width / 2, canvas.height / 2)
    const next = new THREE.CanvasTexture(canvas)
    next.colorSpace = THREE.SRGBColorSpace
    next.needsUpdate = true
    return next
  }, [active, handAction?.startedAt, sampledBpm])

  useEffect(() => () => texture?.dispose(), [texture])

  useFrame(() => {
    if (!group.current || !active) return
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
    group.current.position.copy(camera.position)
      .addScaledVector(forward, 0.48)
      .addScaledVector(right, -0.18)
      .addScaledVector(up, -0.25)
    group.current.quaternion.copy(camera.quaternion)
  })

  if (!active || !texture) return null

  return (
    <group ref={group} raycast={() => null}>
      <mesh renderOrder={20}>
        <planeGeometry args={[0.23, 0.086]} />
        <meshBasicMaterial map={texture} transparent depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
