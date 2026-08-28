import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ApartmentSkeleton } from './game/ApartmentSkeleton'

export default function App() {
  const [isPointerLocked, setIsPointerLocked] = useState(false)

  return (
    <main className="game-shell">
      <Canvas
        id="game-canvas"
        shadows
        camera={{
          position: [0, 1.65, 2.25],
          fov: 70,
          near: 0.1,
          far: 100,
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

      {!isPointerLocked && (
        <div className="pointer-lock-hint" aria-hidden="true">
          <strong>CLIQUE PARA ENTRAR</strong>
          <span>WASD para mover · Shift para correr · ESC para soltar</span>
        </div>
      )}
    </main>
  )
}
