import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ApartmentSkeleton } from '../ApartmentSkeleton'
import { BlackoutArea } from '../areas/blackout/BlackoutArea'
import { BusArea } from '../areas/bus/BusArea'
import { CafeteriaArea } from '../areas/cafeteria/CafeteriaArea'
import { ElevatorArea } from '../areas/elevator/ElevatorArea'
import { Floor22Area } from '../areas/floor22/Floor22Area'
import { Floor30Area } from '../areas/floor30/Floor30Area'
import { Floor37Area } from '../areas/floor37/Floor37Area'
import { LobbyArea } from '../areas/lobby/LobbyArea'
import { LockerArea } from '../areas/locker/LockerArea'
import { PlazaArea } from '../areas/plaza/PlazaArea'
import { StairwellArea } from '../areas/stairwell/StairwellArea'
import { StreetArea } from '../areas/street/StreetArea'
import { AREA_DEFINITIONS } from './areaTypes'
import { useGameStore } from '../state/gameStore'

type AreaDirectorProps = {
  gameStarted: boolean
  isPointerLocked: boolean
  onLockChange: (locked: boolean) => void
}

function AreaCameraSpawn() {
  const { camera } = useThree()
  const location = useGameStore((state) => state.location)

  useEffect(() => {
    const spawn = location.spawn
    if (!spawn) return
    camera.position.set(spawn.x, spawn.y, spawn.z)
    camera.rotation.set(0, spawn.yaw, 0)
    camera.updateMatrixWorld()
  }, [camera, location.area, location.checkpoint, location.spawn])

  return null
}

function StreamingStandby() {
  const location = useGameStore((state) => state.location)
  const definition = AREA_DEFINITIONS[location.area]

  return (
    <group name={`streaming-standby-${definition.area}`}>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#05070a', 2, 18]} />
      <ambientLight color="#8d98a6" intensity={0.08} />
      <mesh receiveShadow position={[0, -0.06, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#101419" roughness={0.98} />
      </mesh>
    </group>
  )
}

export function AreaDirector({ gameStarted, isPointerLocked, onLockChange }: AreaDirectorProps) {
  const area = useGameStore((state) => state.location.area)

  return (
    <>
      <AreaCameraSpawn />
      {area === 'apartment' && <ApartmentSkeleton key="area-apartment" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'street' && <StreetArea key="area-street" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'bus-214' && <BusArea key="area-bus-214" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'meridian-plaza' && <PlazaArea key="area-meridian-plaza" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'lobby' && <LobbyArea key="area-lobby" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'locker-b1' && <LockerArea key="area-locker-b1" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'service-elevator' && <ElevatorArea key="area-service-elevator" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'work-floor-22' && <Floor22Area key="area-work-floor-22" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'work-floor-30' && <Floor30Area key="area-work-floor-30" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'cafeteria' && <CafeteriaArea key="area-cafeteria" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'floor-37' && <Floor37Area key="area-floor-37" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'blackout' && <BlackoutArea key="area-blackout" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area === 'emergency-stairwell' && <StairwellArea key="area-emergency-stairwell" gameStarted={gameStarted} isPointerLocked={isPointerLocked} onLockChange={onLockChange} />}
      {area !== 'apartment' && area !== 'street' && area !== 'bus-214' && area !== 'meridian-plaza' && area !== 'lobby' && area !== 'locker-b1' && area !== 'service-elevator' && area !== 'work-floor-22' && area !== 'work-floor-30' && area !== 'cafeteria' && area !== 'floor-37' && area !== 'blackout' && area !== 'emergency-stairwell' && (
        <StreamingStandby key={`area-${area}`} />
      )}
    </>
  )
}
