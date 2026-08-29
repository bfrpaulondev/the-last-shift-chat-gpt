import { useEffect, useMemo, useState } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { CameraPolish } from '../../player/CameraPolish'
import { PlayerController } from '../../player/PlayerController'
import { TrueFirstPersonBody } from '../../player/TrueFirstPersonBody'
import { PbrEnvironment } from '../../render/PbrEnvironment'
import { PostEffects } from '../../render/PostEffects'
import { useGameStore } from '../../state/gameStore'
import { AreaKAudio } from './AreaKAudio'
import { DESCENT_COLLIDERS, NIGHT_LOBBY_COLLIDERS } from './descentLobbyColliders'
import { DescentProgressController } from './DescentProgressController'
import { DescentStairwellScene } from './DescentStairwellScene'
import { descentGroundHeight, floorFromCheckpoint } from './descentGeometry'
import { NascimentoSequence } from './NascimentoSequence'
import { NightLobbyInteractionSystem } from './NightLobbyInteractionSystem'
import { NightLobbyScene } from './NightLobbyScene'

type DescentLobbyAreaProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

export function DescentLobbyArea({ gameStarted, isPointerLocked, onLockChange }: DescentLobbyAreaProps) {
  const location = useGameStore((state) => state.location)
  const flags = useGameStore((state) => state.flags)
  const noteOpen = useGameStore((state) => Boolean(state.note))
  const cinematic = useGameStore((state) => state.cinematic)
  const blackout = useGameStore((state) => state.blackout)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const areaTransition = useGameStore((state) => state.areaTransition)
  const [floor, setFloor] = useState(() => flags.descent_complete ? 0 : floorFromCheckpoint(location.checkpoint))

  useEffect(() => {
    if (flags.descent_complete || location.checkpoint.startsWith('night-lobby') || location.checkpoint === 'elevator-return') {
      setFloor(0)
      return
    }
    if (location.checkpoint.startsWith('descent-floor-')) setFloor(floorFromCheckpoint(location.checkpoint))
  }, [flags.descent_complete, location.checkpoint])

  useEffect(() => {
    const game = useGameStore.getState()
    if (!game.flags.descent_complete) {
      if (!game.location.checkpoint.startsWith('descent-floor-')) {
        game.setCheckpoint('descent-floor-39', game.location.spawn)
      }
      game.setObjective('Desça a pé até o térreo.')
      return
    }

    if (game.flags.elevator_riding) game.setObjective('Suba ao 39.º andar.')
    else if (game.flags.elevator_alone) game.setObjective('Entre no elevador de serviço.')
    else if (game.flags.nascimento_dead && !game.flags.notebook_taken) game.setObjective('Pegue a caderneta de Nascimento.')
    else if (!game.flags.nascimento_dead) game.setObjective('Vá até Nascimento atrás do balcão.')
  }, [])

  const inLobby = floor === 0 || flags.descent_complete
  const groundHeight = useMemo(
    () => (x: number, z: number) => descentGroundHeight(floor, z) + x * 0,
    [floor],
  )
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
      {inLobby ? <NightLobbyScene /> : <DescentStairwellScene floor={floor} />}
      <AreaKAudio />
      {!inLobby && <DescentProgressController floor={floor} onFloorChange={setFloor} />}
      {inLobby && <NascimentoSequence />}
      {inLobby && gameStarted && <NightLobbyInteractionSystem />}
      <CameraPolish enabled={enabled} />
      <TrueFirstPersonBody enabled={gameStarted && !demoEnded} />
      <PlayerController
        colliders={inLobby ? NIGHT_LOBBY_COLLIDERS : DESCENT_COLLIDERS}
        enabled={enabled}
        groundHeight={inLobby ? undefined : groundHeight}
      />

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
