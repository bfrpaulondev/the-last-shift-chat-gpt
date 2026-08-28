import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ApartmentSkeleton } from './game/ApartmentSkeleton'
import { useGameStore } from './game/state/gameStore'
import { GameHud } from './game/ui/GameHud'

export default function App() {
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const demoEnded = useGameStore((state) => state.demoEnded)

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
          isPointerLocked={isPointerLocked}
          onLockChange={setIsPointerLocked}
        />
      </Canvas>

      <GameHud isPointerLocked={isPointerLocked} />

      {!isPointerLocked && !demoEnded && (
        <div className="pointer-lock-hint" aria-hidden="true">
          <strong>CLIQUE PARA ENTRAR</strong>
          <span>WASD para mover · Shift para correr · E para interagir · ESC para soltar</span>
        </div>
      )}
    </main>
  )
}
