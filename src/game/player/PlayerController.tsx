import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../audio/AudioEngine'
import type { Collider } from '../physics/colliders'

interface PlayerControllerProps {
  colliders: Collider[]
  enabled: boolean
}

const EYE_HEIGHT = 1.65
const PLAYER_RADIUS = 0.25
const WALK_SPEED = 2.2
const SPRINT_SPEED = 3.6
const GRAVITY = -18
const WALK_BOB_FREQUENCY = 8
const SPRINT_BOB_FREQUENCY = 11
const BOB_AMPLITUDE = 0.035
const ACCELERATION = 12
const DECELERATION = 16

const UP = new THREE.Vector3(0, 1, 0)

function intersectsCollider(x: number, z: number, collider: Collider): boolean {
  return (
    x + PLAYER_RADIUS > collider.minX &&
    x - PLAYER_RADIUS < collider.maxX &&
    z + PLAYER_RADIUS > collider.minZ &&
    z - PLAYER_RADIUS < collider.maxZ
  )
}

function isBlocked(x: number, z: number, colliders: Collider[]): boolean {
  return colliders.some((collider) => intersectsCollider(x, z, collider))
}

export function PlayerController({ colliders, enabled }: PlayerControllerProps) {
  const { camera } = useThree()
  const pressedKeys = useRef(new Set<string>())
  const velocity = useRef(new THREE.Vector3())
  const desiredVelocity = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const movement = useRef(new THREE.Vector3())
  const feetY = useRef(0)
  const verticalVelocity = useRef(0)
  const bobPhase = useRef(0)
  const previousStepIndex = useRef(0)
  const currentBob = useRef(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      pressedKeys.current.add(event.code)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.code)
    }

    const initializeAudio = () => {
      void audioEngine.init().catch(() => undefined)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', initializeAudio, { once: true })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', initializeAudio)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      pressedKeys.current.clear()
      velocity.current.set(0, 0, 0)
    }
  }, [enabled])

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05)

    verticalVelocity.current += GRAVITY * safeDelta
    feetY.current += verticalVelocity.current * safeDelta

    if (feetY.current <= 0) {
      feetY.current = 0
      verticalVelocity.current = 0
    }

    if (!enabled) {
      currentBob.current = THREE.MathUtils.damp(currentBob.current, 0, 14, safeDelta)
      return
    }

    const keys = pressedKeys.current
    const forwardInput = Number(keys.has('KeyW')) - Number(keys.has('KeyS'))
    const rightInput = Number(keys.has('KeyD')) - Number(keys.has('KeyA'))
    const running = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = running ? SPRINT_SPEED : WALK_SPEED

    camera.getWorldDirection(forward.current)
    forward.current.y = 0

    if (forward.current.lengthSq() > 0) {
      forward.current.normalize()
    }

    right.current.crossVectors(forward.current, UP).normalize()
    desiredVelocity.current
      .copy(forward.current)
      .multiplyScalar(forwardInput)
      .addScaledVector(right.current, rightInput)

    const hasMovementInput = desiredVelocity.current.lengthSq() > 0

    if (hasMovementInput) {
      desiredVelocity.current.normalize().multiplyScalar(speed)
    }

    const damping = hasMovementInput ? ACCELERATION : DECELERATION
    velocity.current.x = THREE.MathUtils.damp(
      velocity.current.x,
      desiredVelocity.current.x,
      damping,
      safeDelta,
    )
    velocity.current.z = THREE.MathUtils.damp(
      velocity.current.z,
      desiredVelocity.current.z,
      damping,
      safeDelta,
    )

    movement.current.set(
      velocity.current.x * safeDelta,
      0,
      velocity.current.z * safeDelta,
    )

    const nextX = camera.position.x + movement.current.x
    if (!isBlocked(nextX, camera.position.z, colliders)) {
      camera.position.x = nextX
    } else {
      velocity.current.x = 0
    }

    const nextZ = camera.position.z + movement.current.z
    if (!isBlocked(camera.position.x, nextZ, colliders)) {
      camera.position.z = nextZ
    } else {
      velocity.current.z = 0
    }

    const horizontalSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    const moving = horizontalSpeed > 0.08

    if (moving) {
      const bobFrequency = running ? SPRINT_BOB_FREQUENCY : WALK_BOB_FREQUENCY
      bobPhase.current += safeDelta * bobFrequency
      const targetBob = Math.sin(bobPhase.current) * BOB_AMPLITUDE
      currentBob.current = THREE.MathUtils.damp(currentBob.current, targetBob, 18, safeDelta)

      const stepIndex = Math.floor(bobPhase.current / Math.PI)
      if (stepIndex !== previousStepIndex.current) {
        previousStepIndex.current = stepIndex
        audioEngine.playFootstep(running)
      }
    } else {
      currentBob.current = THREE.MathUtils.damp(currentBob.current, 0, 14, safeDelta)
    }

    camera.position.y = feetY.current + EYE_HEIGHT + currentBob.current
  })

  return null
}
