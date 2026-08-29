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
import { SecurityCenterArea } from '../areas/security/SecurityCenterArea'
import { StairwellArea } from '../areas/stairwell/StairwellArea'
import { StreetArea } from '../areas/street/StreetArea'
import { AREA_DEFINITIONS } from './areaTypes'
import { useGameStore } from '../state/gameStore'

type AreaDirectorProps = { gameStarted: boolean; isPointerLocked: boolean; onLockChange: (locked: boolean) => void }

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
  return <group name={`streaming-standby-${definition.area}`}><color attach="background" args={['#05070a']} /><fog attach="fog" args={['#05070a', 2, 18]} /><ambientLight color="#8d98a6" intensity={0.08} /><mesh receiveShadow position={[0, -0.06, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#101419" roughness={0.98} /></mesh></group>
}

export function AreaDirector({ gameStarted, isPointerLocked, onLockChange }: AreaDirectorProps) {
  const area = useGameStore((state) => state.location.area)
  const props = { gameStarted, isPointerLocked, onLockChange }
  return (
    <>
      <AreaCameraSpawn />
      {area === 'apartment' && <ApartmentSkeleton key="area-apartment" {...props} />}
      {area === 'street' && <StreetArea key="area-street" {...props} />}
      {area === 'bus-214' && <BusArea key="area-bus-214" {...props} />}
      {area === 'meridian-plaza' && <PlazaArea key="area-meridian-plaza" {...props} />}
      {area === 'lobby' && <LobbyArea key="area-lobby" {...props} />}
      {area === 'locker-b1' && <LockerArea key="area-locker-b1" {...props} />}
      {area === 'service-elevator' && <ElevatorArea key="area-service-elevator" {...props} />}
      {area === 'work-floor-22' && <Floor22Area key="area-work-floor-22" {...props} />}
      {area === 'work-floor-30' && <Floor30Area key="area-work-floor-30" {...props} />}
      {area === 'cafeteria' && <CafeteriaArea key="area-cafeteria" {...props} />}
      {area === 'floor-37' && <Floor37Area key="area-floor-37" {...props} />}
      {area === 'blackout' && <BlackoutArea key="area-blackout" {...props} />}
      {area === 'emergency-stairwell' && <StairwellArea key="area-emergency-stairwell" {...props} />}
      {area === 'security-center' && <SecurityCenterArea key="area-security-center" {...props} />}
      {!['apartment','street','bus-214','meridian-plaza','lobby','locker-b1','service-elevator','work-floor-22','work-floor-30','cafeteria','floor-37','blackout','emergency-stairwell','security-center'].includes(area) && <StreamingStandby key={`area-${area}`} />}
    </>
  )
}
