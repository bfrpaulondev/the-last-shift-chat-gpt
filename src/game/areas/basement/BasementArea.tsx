import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { BasementAudio } from './BasementAudio'
import { BasementInteractionSystem } from './BasementInteractionSystem'
import { BasementScene } from './BasementScene'
import { BasementSystems } from './BasementSystems'
import { BASEMENT_COLLIDERS } from './basementColliders'

type BasementAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

function BasementFlashlight() {
  const { camera, scene } = useThree()
  const light = useRef<THREE.SpotLight>(null)
  const target = useRef(new THREE.Object3D())
  const flashlightOn = useGameStore((state) => state.flashlightOn)
  const phoneBattery = useGameStore((state) => state.phoneBattery)
  const direction = useRef(new THREE.Vector3())

  useEffect(() => {
    scene.add(target.current)
    return () => {
      scene.remove(target.current)
    }
  }, [scene])

  useFrame(() => {
    const spot = light.current
    if (!spot) return
    spot.visible = flashlightOn && phoneBattery > 0
    spot.position.copy(camera.position)
    camera.getWorldDirection(direction.current)
    target.current.position.copy(camera.position).addScaledVector(direction.current, 8)
    spot.target = target.current
  })

  return (
    <spotLight
      ref={light}
      intensity={2.7}
      distance={12}
      angle={0.3}
      penumbra={0.72}
      decay={1.7}
      color="#e5e2cf"
      castShadow={false}
    />
  )
}

export function BasementArea({ gameStarted, isPointerLocked, onLockChange }: BasementAreaProps) {
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)

  useEffect(() => {
    const game = useGameStore.getState()
    game.setFlag('part4_started')
    game.setObjective('Investigue o movimento e a CAM 04 no estacionamento B1.')
    if (!game.flags.descent_dark) {
      game.setFlag('descent_dark')
      game.setBlackout(true)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area === 'basement') latest.setBlackout(false)
      }, 2000)
    }
  }, [])

  const enabled =
    gameStarted &&
    isPointerLocked &&
    !noteOpen &&
    !cinematic &&
    !blackout &&
    !scareActive &&
    !demoEnded &&
    !areaTransition

  return (
    <>
      <PbrEnvironment />
      <BasementScene />
      <BasementFlashlight />
      <BasementAudio />
      <BasementSystems />
      {gameStarted && <BasementInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController colliders={BASEMENT_COLLIDERS} enabled={enabled} />

      {gameStarted && !demoEnded && (
        <PointerLockControls
          makeDefault
          onLock={() => onLockChange(true)}
          onUnlock={() => onLockChange(false)}
        />
      )}

      <PostEffects />
    </>
  )
}
