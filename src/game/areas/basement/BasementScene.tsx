import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { JudasCat } from './JudasCat'

function ConcreteBox({
  position,
  scale,
  color = '#25282b',
}: {
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position} scale={scale} receiveShadow castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.96} metalness={0.02} />
    </mesh>
  )
}

function ParkingBay({ x, number }: { x: number; number: string }) {
  return (
    <group position={[x, 0, 8.4]}>
      <mesh position={[-1.55, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 5.4]} />
        <meshBasicMaterial color="#b5aa76" />
      </mesh>
      <mesh position={[1.55, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 5.4]} />
        <meshBasicMaterial color="#b5aa76" />
      </mesh>
      <Text position={[0, 0.018, -1.8]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.38} color="#a7a49a">
        {number}
      </Text>
    </group>
  )
}

function Sedan() {
  return (
    <group position={[4.35, 0.02, 8.5]} userData={{ basementInteractableId: 'ceo-car' }}>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[2.25, 0.7, 4.25]} />
        <meshStandardMaterial color="#555b60" roughness={0.62} metalness={0.48} />
      </mesh>
      <mesh position={[0, 1.12, 0.1]} castShadow>
        <boxGeometry args={[1.82, 0.62, 2.28]} />
        <meshStandardMaterial color="#43484c" roughness={0.55} metalness={0.4} />
      </mesh>
      {[[-0.98, 0.42, 1.35], [0.98, 0.42, 1.35], [-0.98, 0.42, -1.35], [0.98, 0.42, -1.35]].map((p, index) => (
        <mesh key={index} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.22, 12]} />
          <meshStandardMaterial color="#0d0f10" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.02, -1.15]}>
        <boxGeometry args={[1.55, 0.35, 0.08]} />
        <meshStandardMaterial color="#152027" roughness={0.32} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0.42, 0.92, -1.0]} castShadow>
        <boxGeometry args={[0.7, 0.42, 0.42]} />
        <meshStandardMaterial color="#25201d" roughness={0.86} />
      </mesh>
      <Text position={[0, 0.03, -2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#d3cdb0">
        RESERVADO — BRANDÃO, O.
      </Text>
    </group>
  )
}

function Camera04() {
  return (
    <group position={[-5.9, 2.62, 2.45]} rotation={[0, -0.25, 0]} userData={{ basementInteractableId: 'cam04-monitor' }}>
      <mesh castShadow>
        <boxGeometry args={[0.52, 0.3, 0.7]} />
        <meshStandardMaterial color="#d3d5d1" roughness={0.76} />
      </mesh>
      <mesh position={[0, 0, 0.39]}>
        <cylinderGeometry args={[0.12, 0.16, 0.28, 10]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.48} />
      </mesh>
      <mesh position={[0.22, 0.1, 0.37]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#ef302b" emissive="#ef302b" emissiveIntensity={1.3} />
      </mesh>
    </group>
  )
}

function MaintenanceMonitor() {
  return (
    <group position={[-5.25, 1.32, 2.05]} rotation={[0, 0.22, 0]} userData={{ basementInteractableId: 'cam04-monitor' }}>
      <mesh castShadow>
        <boxGeometry args={[1.18, 0.82, 0.14]} />
        <meshStandardMaterial color="#1a1d1e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[1.02, 0.65]} />
        <meshBasicMaterial color="#182127" />
      </mesh>
      <Text position={[0, 0.04, 0.081]} fontSize={0.075} maxWidth={0.95} color="#8fb99d" anchorX="center">
        {'CAM 04  23:50:07\nFRAME BUFFER — NO SIGNAL'}
      </Text>
      <mesh position={[0.44, -0.33, 0.09]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#9d312b" emissive="#9d312b" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function TechnicalRoom() {
  const leds = useMemo(() => Array.from({ length: 18 }, (_, index) => index), [])
  return (
    <group>
      <ConcreteBox position={[2.15, 1.5, 1.95]} scale={[9.2, 3, 0.2]} />
      <ConcreteBox position={[-2.65, 1.5, -2.4]} scale={[0.2, 3, 8.8]} />
      <ConcreteBox position={[6.95, 1.5, -2.4]} scale={[0.2, 3, 8.8]} />
      <ConcreteBox position={[2.15, 1.5, -6.65]} scale={[9.4, 3, 0.2]} />
      <Text position={[1.9, 2.42, 2.04]} fontSize={0.26} color="#b7b7ae">
        SALA TÉCNICA — ACESSO RESTRITO
      </Text>
      <group position={[4.75, 1.4, -3.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.1, 2.7, 0.85]} />
          <meshStandardMaterial color="#171b1d" roughness={0.65} metalness={0.72} />
        </mesh>
        {leds.map((index) => (
          <mesh key={index} position={[-0.75 + (index % 3) * 0.28, 1.05 - Math.floor(index / 3) * 0.29, 0.435]}>
            <sphereGeometry args={[0.018, 6, 5]} />
            <meshStandardMaterial
              color={index === 11 ? '#3b76ff' : index % 5 === 0 ? '#d59b32' : '#58ba76'}
              emissive={index === 11 ? '#3b76ff' : index % 5 === 0 ? '#d59b32' : '#58ba76'}
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[2.5, 0.76, -1.65]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.12, 1.2]} />
        <meshStandardMaterial color="#3d3b35" roughness={0.84} />
      </mesh>
      <mesh position={[2.5, 1.35, -1.72]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[1.15, 0.72, 0.09]} />
        <meshStandardMaterial color="#191d20" roughness={0.66} />
      </mesh>
      <Text position={[2.5, 1.36, -1.66]} rotation={[-0.18, 0, 0]} fontSize={0.075} maxWidth={1.05} color="#9ab6a0">
        {'MIGRAÇÃO INTERNA\nCHECKLIST 60% PENDENTE\nSW-12 — NÃO CHEGOU'}
      </Text>
      <group position={[1.45, 0.92, -1.48]}>
        <mesh castShadow>
          <boxGeometry args={[0.84, 0.18, 0.56]} />
          <meshStandardMaterial color="#292d30" roughness={0.6} metalness={0.44} />
        </mesh>
        <Text position={[0, 0.1, 0.05]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.075} color="#ddd8c9">
          SW-12
        </Text>
      </group>
      <mesh position={[0.9, 0.9, -1.1]} castShadow userData={{ basementInteractableId: 'outlet' }}>
        <boxGeometry args={[0.26, 0.42, 0.08]} />
        <meshStandardMaterial color="#d3d0c5" roughness={0.8} />
      </mesh>
      <group position={[3.2, 0.38, -4.7]} userData={{ basementInteractableId: 'diego-phone' }}>
        <mesh position={[0, 0.45, 0]} rotation={[0.1, 0.1, 0.02]} castShadow>
          <boxGeometry args={[0.68, 0.9, 0.34]} />
          <meshStandardMaterial color="#30383e" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.95, 0.04]} castShadow>
          <sphereGeometry args={[0.28, 12, 8]} />
          <meshStandardMaterial color="#8e6758" roughness={0.78} />
        </mesh>
        <mesh position={[0.48, 0.34, 0.12]} rotation={[1.2, 0.1, -0.3]} castShadow>
          <boxGeometry args={[0.18, 0.36, 0.035]} />
          <meshStandardMaterial color="#11161a" emissive="#182a31" emissiveIntensity={0.45} roughness={0.42} />
        </mesh>
        <mesh position={[-0.46, 0.12, 0.34]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 0.22]} />
          <meshStandardMaterial color="#d5d0c2" roughness={0.75} />
        </mesh>
        <Text position={[-0.46, 0.127, 0.34]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.055} color="#283136">
          0527
        </Text>
      </group>
      <mesh position={[1.5, 0.045, -4.2]} rotation={[-Math.PI / 2, 0, 0]} userData={{ basementInteractableId: 'blue-cable' }}>
        <planeGeometry args={[0.05, 5.2]} />
        <meshBasicMaterial color="#245cae" />
      </mesh>
      <group position={[1.52, 0.45, -6.05]} userData={{ basementInteractableId: 'migration-box' }}>
        <mesh castShadow>
          <boxGeometry args={[1.35, 0.85, 1.1]} />
          <meshStandardMaterial color="#8f7857" roughness={0.96} />
        </mesh>
        <Text position={[0, 0.08, 0.56]} fontSize={0.09} maxWidth={1.15} color="#29251f" anchorX="center">
          {'MIGRAÇÃO — NÃO DESCARTAR\nTI-INTERNO'}
        </Text>
        <group position={[0, 0.22, 0]} userData={{ basementInteractableId: 'ghost-switch' }}>
          <mesh castShadow>
            <boxGeometry args={[0.86, 0.18, 0.58]} />
            <meshStandardMaterial color="#24282b" roughness={0.58} metalness={0.46} />
          </mesh>
          <Text position={[0, 0.1, 0.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color="#dadad2">
            12
          </Text>
          <mesh position={[0.34, 0.02, 0.295]}>
            <sphereGeometry args={[0.024, 7, 5]} />
            <meshStandardMaterial color="#3472ff" emissive="#3472ff" emissiveIntensity={1.5} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function ArchiveRoom() {
  const rows = [-7.25, -4.25, -1.25, 1.75]
  return (
    <group>
      <Text position={[-0.2, 2.48, -8.05]} fontSize={0.26} color="#a9a79d">
        ANEXO B2 — ARQUIVO MORTO
      </Text>
      {rows.map((x, row) => (
        <group key={x} position={[x, 0, -11.7]}>
          <ConcreteBox position={[0, 1.12, 0]} scale={[0.55, 2.24, 5.2]} color="#34383a" />
          {[-1.8, -0.9, 0, 0.9, 1.8].map((z, index) => (
            <mesh key={z} position={[row % 2 === 0 ? 0.31 : -0.31, 0.7 + (index % 2) * 0.55, z]} castShadow>
              <boxGeometry args={[0.55, 0.42, 0.72]} />
              <meshStandardMaterial color="#8a7457" roughness={0.94} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[-5.25, 1.15, -14.7]} userData={{ basementInteractableId: 'vale-dossier' }}>
        <mesh castShadow rotation={[0.02, 0, 0.08]}>
          <boxGeometry args={[0.86, 0.02, 1.12]} />
          <meshStandardMaterial color="#d9d2bd" roughness={0.9} />
        </mesh>
      </group>
      <group position={[3.75, 1.25, -14.8]} userData={{ basementInteractableId: 'approvals-missing' }}>
        <mesh>
          <boxGeometry args={[1.6, 0.03, 0.45]} />
          <meshStandardMaterial color="#4a4d4c" roughness={0.8} />
        </mesh>
        <Text position={[0, 0.05, 0.01]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color="#d0cbb9">
          BRANDÃO, O. — APROVAÇÕES
        </Text>
      </group>
      <mesh position={[0, 2.75, -11.6]}>
        <planeGeometry args={[2.2, 0.55]} />
        <meshStandardMaterial color="#17191a" roughness={0.95} />
      </mesh>
    </group>
  )
}

function BasementLights() {
  return (
    <>
      <ambientLight intensity={0.045} color="#7d8790" />
      <pointLight position={[-6, 2.4, 9]} intensity={0.72} distance={9} color="#d5ddb8" />
      <pointLight position={[5, 2.3, 4]} intensity={0.55} distance={8} color="#cfd6b8" />
      <pointLight position={[4.5, 2.1, -3]} intensity={0.45} distance={7} color="#8aa58c" />
    </>
  )
}

export function BasementScene() {
  return (
    <group name="part4-basement-scene">
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 4, 27]} />
      <BasementLights />
      <ConcreteBox position={[0, -0.08, -0.5]} scale={[18, 0.16, 31]} color="#202326" />
      <ConcreteBox position={[0, 3.05, -0.5]} scale={[18, 0.16, 31]} color="#151719" />
      <ConcreteBox position={[-9.05, 1.5, -0.5]} scale={[0.2, 3, 31]} />
      <ConcreteBox position={[9.05, 1.5, -0.5]} scale={[0.2, 3, 31]} />
      {[12.5, 5.5, -1.5, -8.5, -15.5].map((z) => (
        <group key={z}>
          <ConcreteBox position={[-4.5, 1.5, z]} scale={[0.55, 3, 0.55]} color="#343638" />
          <ConcreteBox position={[4.5, 1.5, z]} scale={[0.55, 3, 0.55]} color="#343638" />
        </group>
      ))}
      <ParkingBay x={-4.3} number="06" />
      <ParkingBay x={0} number="07" />
      <ParkingBay x={4.3} number="08" />
      <Sedan />
      <Camera04 />
      <MaintenanceMonitor />
      <TechnicalRoom />
      <ArchiveRoom />
      <JudasCat />
      <group position={[6.35, 1.15, -14.4]} userData={{ basementInteractableId: 'return-elevator' }}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 2.3, 0.18]} />
          <meshStandardMaterial color="#43484a" roughness={0.66} metalness={0.52} />
        </mesh>
        <Text position={[0, 0.65, 0.1]} fontSize={0.18} color="#d6d2c3">
          ELEVADOR DE SERVIÇO
        </Text>
      </group>
    </group>
  )
}
