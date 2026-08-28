import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ApartmentSkeleton } from './game/ApartmentSkeleton'
import { audioEngine } from './game/audio/AudioEngine'
import { useGameStore } from './game/state/gameStore'
import { GameHud } from './game/ui/GameHud'
import { TitleScreen } from './game/ui/TitleScreen'

type IntroPhase = 'title' | 'transition' | 'playing'

export default function App() {
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [introPhase, setIntroPhase] = useState<IntroPhase>('title')
  const [muted, setMuted] = useState(false)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const gameStarted = introPhase === 'playing'

  const startGame = useCallback(() => {
    setIntroPhase((current) => {
      if (current !== 'title') {
        return current
      }

      window.setTimeout(() => {
        setIntroPhase('playing')
      }, 1600)

      return 'transition'
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM') {
        return
      }

      setMuted(audioEngine.toggleMute())
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="game-shell">
      <Canvas
        id="game-canvas"
        shadows
        dpr={1 / 3}
        camera={{
          position: [-1.52, 1.35, -0.45],
          rotation: [-0.087, Math.PI, 0],
          fov: 70,
          near: 0.1,
          far: 160,
        }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <color attach="background" args={['#0d1017']} />
        <ApartmentSkeleton
          gameStarted={gameStarted}
          isPointerLocked={isPointerLocked}
          onLockChange={setIsPointerLocked}
        />
      </Canvas>

      {gameStarted && <GameHud isPointerLocked={isPointerLocked} muted={muted} />}

      {!gameStarted && (
        <TitleScreen
          phase={introPhase === 'transition' ? 'transition' : 'title'}
          onStart={startGame}
        />
      )}

      {gameStarted && !isPointerLocked && !demoEnded && (
        <div className="pointer-lock-hint" aria-hidden="true">
          <strong>CLIQUE PARA ENTRAR</strong>
          <span>WASD para mover · Shift para correr · E para interagir · M para mutar · ESC para soltar</span>
        </div>
      )}
    </main>
  )
}
