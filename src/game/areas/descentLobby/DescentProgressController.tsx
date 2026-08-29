import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'
import {
  DESCENT_START_FLOOR,
  DESCENT_TOP_Z,
  DESCENT_TRIGGER_Z,
  descentBaseY,
} from './descentGeometry'

const LOBBY_SPAWN = { x: 0, y: 1.65, z: 4.35, yaw: Math.PI }
const CHECKPOINT_FLOORS = new Set([36, 33, 30, 27, 24, 21, 18, 15, 13, 12, 9, 6, 3, 1])
const TELEMETRY_FLOORS = new Set([30, 20, 13, 10, 1])

export function DescentProgressController({
  floor,
  onFloorChange,
}: {
  floor: number
  onFloorChange: (floor: number) => void
}) {
  const { camera } = useThree()
  const busy = useRef(false)

  useFrame(() => {
    const game = useGameStore.getState()
    if (
      busy.current ||
      floor <= 0 ||
      game.location.area !== 'descent-lobby' ||
      game.cinematic ||
      game.areaTransition ||
      game.note ||
      game.subtitle ||
      game.demoEnded ||
      camera.position.z > DESCENT_TRIGGER_Z
    ) return

    busy.current = true
    const nextFloor = floor - 1

    if (!game.flags.descent_started) game.setFlag('descent_started')

    if (nextFloor <= 0) {
      game.setFlag('descent_complete')
      game.setCheckpoint('night-lobby-entry', LOBBY_SPAWN)
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'descent:ground-floor',
        wasFirstTime: true,
      })
      game.requestAreaTransition('descent-lobby', 'night-lobby-entry', LOBBY_SPAWN, 1200)
      onFloorChange(0)
      window.setTimeout(() => { busy.current = false }, 1250)
      return
    }

    onFloorChange(nextFloor)
    const spawn = {
      x: THREE.MathUtils.clamp(camera.position.x, -1.8, 1.8),
      y: descentBaseY(nextFloor) + 1.65,
      z: DESCENT_TOP_Z - 0.12,
      yaw: camera.rotation.y,
    }
    camera.position.set(spawn.x, spawn.y, spawn.z)

    if (CHECKPOINT_FLOORS.has(nextFloor)) {
      game.setCheckpoint(`descent-floor-${nextFloor}`, spawn)
    }

    if (TELEMETRY_FLOORS.has(nextFloor)) {
      const seen = `descent_floor_${nextFloor}_seen`
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `descent:floor-${nextFloor}`,
        wasFirstTime: !game.flags[seen],
      })
      game.setFlag(seen)
    }

    game.setObjective(`Continue descendo a pé — ${nextFloor} ${nextFloor === 1 ? 'andar' : 'andares'} até o térreo.`)
    window.setTimeout(() => { busy.current = false }, 180)
  })

  if (floor > DESCENT_START_FLOOR) return null
  return null
}
