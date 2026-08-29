import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Part3AnxietyController } from './game/anxiety/Part3AnxietyController'
import { PersistenceManager } from './game/api/PersistenceManager'
import { BusTriageOverlay } from './game/areas/bus/BusTriageOverlay'
import { audioEngine } from './game/audio/AudioEngine'
import { AreaDirector } from './game/flow/AreaDirector'
import { AreaTransitionOverlay } from './game/flow/AreaTransitionOverlay'
import { useGameStore } from './game/state/gameStore'
import { ShiftClockController } from './game/time/ShiftClockController'
import { GameHud } from './game/ui/GameHud'
import { TitleScreen } from './game/ui/TitleScreen'

type IntroPhase = 'title' | 'transition' | 'playing'

export default function App() {
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [introPhase, setIntroPhase] = useState<IntroPhase>('title')
  const [muted, setMuted] = useState(false)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const currentArea = useGameStore((state) => state.location.area)
  const areaTransition = useGameStore((state) => state.areaTransition)
  const blackout = useGameStore((state) => state.blackout)
  const gameStarted = introPhase === 'playing'

  const startGame = useCallback(() => {
    setIntroPhase((current) => {
      if (current !== 'title') return current

      window.setTimeout(() => {
        setIntroPhase('playing')
      }, 1600)

      return 'transition'
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM') return
      setMuted(audioEngine.toggleMute())
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="game-shell">
      <PersistenceManager gameStarted={gameStarted} />
      <ShiftClockController enabled={gameStarted && !demoEnded} />
      {gameStarted && !demoEnded && <Part3AnxietyController />}

      <Canvas
        id="game-canvas"
        shadows
        dpr={[1.5, 2]}
        camera={{
          position: [-1.52, 1.35, -0.45],
          rotation: [-0.087, Math.PI, 0],
          fov: 70,
          near: 0.05,
          far: 160,
        }}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.autoUpdate = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.86
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.setClearColor('#080b0f', 1)
        }}
      >
        <color attach="background" args={['#080b0f']} />
        <AreaDirector
          gameStarted={gameStarted}
          isPointerLocked={isPointerLocked}
          onLockChange={setIsPointerLocked}
        />
      </Canvas>

      {gameStarted && <GameHud isPointerLocked={isPointerLocked} muted={muted} />}
      {gameStarted && currentArea === 'bus-214' && <BusTriageOverlay />}
      <AreaTransitionOverlay />

      {!gameStarted && (
        <TitleScreen
          phase={introPhase === 'transition' ? 'transition' : 'title'}
          onStart={startGame}
        />
      )}

      {gameStarted &&
        !blackout &&
        !isPointerLocked &&
        !demoEnded &&
        !areaTransition && (
          <div className="pointer-lock-hint" aria-hidden="true">
            <strong>CLIQUE PARA ENTRAR</strong>
            <span>WASD mover · Shift correr · E interagir · SPACE continuar fala / respirar · RMB inspecionar · M áudio · ESC soltar</span>
          </div>
        )}
    </main>
  )
}
