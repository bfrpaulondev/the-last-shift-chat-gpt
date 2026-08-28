import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]
type DecalKind = 'scuff' | 'damp' | 'grease' | 'rust' | 'dust' | 'coffee'

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createDecalTexture(kind: DecalKind): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.clearRect(0, 0, 256, 256)
  const palette: Record<DecalKind, string> = {
    scuff: '72,65,58',
    damp: '62,73,66',
    grease: '72,56,39',
    rust: '126,67,35',
    dust: '167,155,137',
    coffee: '82,47,28',
  }

  if (kind === 'coffee') {
    context.strokeStyle = `rgba(${palette[kind]},0.58)`
    context.lineWidth = 14
    context.beginPath()
    context.arc(128, 128, 72, 0.18, Math.PI * 1.92)
    context.stroke()
    context.strokeStyle = `rgba(${palette[kind]},0.18)`
    context.lineWidth = 4
    context.beginPath()
    context.arc(128, 128, 88, 0, Math.PI * 2)
    context.stroke()
  } else {
    for (let index = 0; index < 38; index += 1) {
      const x = 25 + seeded(index, 3) * 206
      const y = 25 + seeded(index, 7) * 206
      const rx = 8 + seeded(index, 11) * (kind === 'damp' ? 54 : 30)
      const ry = 5 + seeded(index, 13) * (kind === 'grease' ? 22 : 38)
      const alpha = 0.025 + seeded(index, 17) * (kind === 'rust' ? 0.16 : 0.1)
      context.fillStyle = `rgba(${palette[kind]},${alpha})`
      context.beginPath()
      context.ellipse(x, y, rx, ry, seeded(index, 19) * Math.PI, 0, Math.PI * 2)
      context.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function createReceiptTexture(title: string, total: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#e9e5d8')
  gradient.addColorStop(1, '#cfc8b5')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < canvas.height; y += 9) {
    context.fillStyle = `rgba(80,70,55,${0.015 + seeded(y, 3) * 0.025})`
    context.fillRect(0, y, canvas.width, 2)
  }

  context.fillStyle = '#34322f'
  context.textAlign = 'center'
  context.font = '700 40px monospace'
  context.fillText(title, 256, 72)
  context.font = '24px monospace'
  const rows = ['ENERGIA', 'ÁGUA', 'TRANSPORTE', 'ALUGUEL', 'MERCADO']
  rows.forEach((row, index) => {
    context.textAlign = 'left'
    context.fillText(row, 54, 165 + index * 72)
    context.textAlign = 'right'
    context.fillText(`${18 + index * 17},${index}0`, 458, 165 + index * 72)
  })
  context.strokeStyle = '#45413b'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(52, 570)
  context.lineTo(460, 570)
  context.stroke()
  context.font = '700 34px monospace'
  context.textAlign = 'right'
  context.fillText(total, 458, 630)
  context.font = 'italic 18px serif'
  context.fillStyle = '#6d675d'
  context.fillText('vencido', 458, 692)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function SoftBox({
  position,
  size,
  color,
  rotation = [0, 0, 0],
  roughness = 0.82,
  metalness = 0,
  radius = 0.025,
}: {
  position: Vec3
  size: Vec3
  color: string
  rotation?: Vec3
  roughness?: number
  metalness?: number
  radius?: number
}) {
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={3}
      castShadow
      receiveShadow
      raycast={() => null}
      position={position}
      rotation={rotation}
    >
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </RoundedBox>
  )
}

function Decal({
  texture,
  position,
  size,
  rotation = [0, 0, 0],
  opacity = 1,
}: {
  texture: THREE.Texture
  position: Vec3
  size: [number, number]
  rotation?: Vec3
  opacity?: number
}) {
  return (
    <mesh raycast={() => null} position={position} rotation={rotation} renderOrder={2}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={opacity}
        roughness={1}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}

function Cable({ points, color = '#18191b', radius = 0.009 }: { points: Vec3[]; color?: string; radius?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points])
  return (
    <mesh raycast={() => null} castShadow>
      <tubeGeometry args={[curve, 28, radius, 6, false]} />
      <meshStandardMaterial color={color} roughness={0.74} />
    </mesh>
  )
}

function BedroomLivedIn({ scuff, dust }: { scuff: THREE.Texture; dust: THREE.Texture }) {
  return (
    <group>
      <SoftBox position={[-2.56, 0.67, -0.83]} size={[0.78, 0.055, 1.28]} color="#55585d" rotation={[0.035, 0.1, -0.04]} radius={0.04} />
      <SoftBox position={[-2.14, 0.71, -1.18]} size={[0.58, 0.045, 0.88]} color="#4a4d52" rotation={[-0.04, -0.18, 0.08]} radius={0.035} />
      <SoftBox position={[-2.7, 0.72, -1.52]} size={[0.5, 0.04, 0.62]} color="#5d6064" rotation={[0.08, 0.22, -0.05]} radius={0.035} />
      <SoftBox position={[-2.72, 0.7, -1.98]} size={[0.44, 0.18, 0.3]} color="#8b8982" rotation={[0.04, -0.12, 0.08]} radius={0.07} />

      <SoftBox position={[-2.96, 0.08, -2.55]} size={[0.35, 0.1, 0.2]} color="#2f3135" rotation={[0.03, 0.3, 0]} radius={0.035} />
      <SoftBox position={[-2.58, 0.075, -2.5]} size={[0.34, 0.095, 0.19]} color="#282a2c" rotation={[-0.02, -0.22, 0]} radius={0.035} />

      <SoftBox position={[-0.7, 0.74, -2.08]} size={[0.22, 0.07, 0.13]} color="#24272a" radius={0.03} />
      <Cable points={[[-0.76, 0.7, -2.04], [-0.84, 0.45, -2.2], [-0.96, 0.16, -2.35], [-1.05, 0.04, -2.42]]} radius={0.007} />
      <Cable points={[[-1.05, 0.04, -2.42], [-1.25, 0.035, -2.38], [-1.42, 0.03, -2.28]]} radius={0.006} />

      <group position={[-0.4, 0.06, -0.42]} rotation={[0, -0.26, 0]}>
        <SoftBox position={[0, 0, 0]} size={[0.42, 0.055, 0.3]} color="#35383c" radius={0.025} />
        <SoftBox position={[0.08, 0.045, 0.02]} size={[0.33, 0.035, 0.25]} color="#5a514a" rotation={[0.08, 0.08, 0]} radius={0.02} />
      </group>

      <Decal texture={scuff} position={[-3.438, 0.52, -0.15]} size={[0.72, 0.62]} rotation={[0, Math.PI / 2, 0]} opacity={0.9} />
      <Decal texture={dust} position={[-2.4, 0.008, -0.2]} size={[1.2, 0.35]} rotation={[-Math.PI / 2, 0, 0]} opacity={0.55} />
      <Decal texture={scuff} position={[-2.55, 0.55, -2.936]} size={[0.58, 0.44]} opacity={0.65} />
    </group>
  )
}

function BathroomLivedIn({ damp, rust }: { damp: THREE.Texture; rust: THREE.Texture }) {
  return (
    <group>
      <SoftBox position={[3.405, 1.55, -1.6]} size={[0.035, 0.72, 0.52]} color="#716b64" radius={0.015} />
      {[0, 1, 2, 3].map((index) => (
        <SoftBox
          key={index}
          position={[3.385, 1.3 + index * 0.16, -1.58 + Math.sin(index) * 0.025]}
          size={[0.018, 0.03, 0.48]}
          color="#84796a"
          rotation={[0.02, 0, index % 2 ? 0.035 : -0.025]}
          radius={0.01}
        />
      ))}

      <group position={[1.66, 1.23, -2.7]}>
        <SoftBox position={[0, 0, 0]} size={[0.19, 0.055, 0.1]} color="#c3b29a" radius={0.022} />
        <mesh raycast={() => null} position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.008, 8, 22]} />
          <meshStandardMaterial color="#ded6ca" roughness={0.88} />
        </mesh>
      </group>

      <group position={[2.66, 1.04, -2.71]}>
        <mesh raycast={() => null} castShadow>
          <cylinderGeometry args={[0.052, 0.05, 0.22, 14]} />
          <meshPhysicalMaterial color="#d5d0c2" roughness={0.42} clearcoat={0.18} />
        </mesh>
        <SoftBox position={[0, 0.125, 0]} size={[0.035, 0.05, 0.035]} color="#9f927e" radius={0.01} />
      </group>

      <group position={[2.87, 0.06, -1.15]} rotation={[0, -0.16, 0]}>
        <mesh raycast={() => null} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.2, 16]} />
          <meshStandardMaterial color="#e2ddd2" roughness={0.68} />
        </mesh>
        <mesh raycast={() => null} position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.013, 8, 28]} />
          <meshStandardMaterial color="#c8c2b8" roughness={0.75} />
        </mesh>
      </group>

      <Decal texture={damp} position={[1.515, 1.65, -2.15]} size={[0.72, 0.9]} rotation={[0, Math.PI / 2, 0]} opacity={0.72} />
      <Decal texture={damp} position={[2.85, 1.2, -2.924]} size={[0.56, 0.8]} opacity={0.55} />
      <Decal texture={rust} position={[2.94, 0.025, -2.54]} size={[0.32, 0.32]} rotation={[-Math.PI / 2, 0, 0]} opacity={0.88} />
      <Decal texture={rust} position={[1.99, 0.72, -2.414]} size={[0.34, 0.24]} rotation={[0, 0, 0]} opacity={0.48} />
    </group>
  )
}

function KitchenLivedIn({ grease, coffee }: { grease: THREE.Texture; coffee: THREE.Texture }) {
  return (
    <group>
      <mesh raycast={() => null} position={[-2.53, 1.0, 2.555]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.045, 28]} />
        <meshPhysicalMaterial color="#a9adb0" metalness={0.78} roughness={0.28} clearcoat={0.18} />
      </mesh>
      <mesh raycast={() => null} position={[-2.53, 1.03, 2.555]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.015, 8, 28]} />
        <meshStandardMaterial color="#42484b" metalness={0.55} roughness={0.38} />
      </mesh>

      {[0, 1, 2].map((index) => (
        <mesh key={index} raycast={() => null} position={[-1.42 - index * 0.1, 1.04 + index * 0.018, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11 - index * 0.008, 0.11 - index * 0.008, 0.018, 24]} />
          <meshStandardMaterial color="#d1cdc1" roughness={0.58} />
        </mesh>
      ))}

      <group position={[-2.95, 0.1, 2.16]} rotation={[0, 0.12, 0]}>
        <mesh raycast={() => null}>
          <cylinderGeometry args={[0.18, 0.15, 0.38, 14]} />
          <meshStandardMaterial color="#26282a" roughness={0.82} />
        </mesh>
        <SoftBox position={[0.12, 0.15, 0]} size={[0.08, 0.16, 0.1]} color="#222426" radius={0.03} />
      </group>

      <SoftBox position={[-1.18, 0.05, 2.25]} size={[0.42, 0.09, 0.32]} color="#1e2021" rotation={[0, -0.22, 0]} radius={0.04} />
      <SoftBox position={[-1.13, 0.11, 2.22]} size={[0.3, 0.04, 0.24]} color="#323537" rotation={[0.03, -0.18, 0.04]} radius={0.025} />

      <Decal texture={grease} position={[-1.92, 1.25, 2.928]} size={[1.25, 0.58]} opacity={0.55} />
      <Decal texture={coffee} position={[-1.48, 1.022, 2.45]} size={[0.2, 0.2]} rotation={[-Math.PI / 2, 0, 0]} opacity={0.72} />
      <Decal texture={grease} position={[-3.326, 1.05, 1.3]} size={[0.24, 0.62]} rotation={[0, Math.PI / 2, 0]} opacity={0.48} />
    </group>
  )
}

function HallwayLivedIn({ receiptA, receiptB, scuff }: { receiptA: THREE.Texture; receiptB: THREE.Texture; scuff: THREE.Texture }) {
  return (
    <group>
      <mesh raycast={() => null} position={[2.53, 0.965, 2.57]} rotation={[-Math.PI / 2, 0, -0.08]}>
        <planeGeometry args={[0.25, 0.36]} />
        <meshStandardMaterial map={receiptA} roughness={0.95} />
      </mesh>
      <mesh raycast={() => null} position={[2.69, 0.97, 2.54]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[0.22, 0.32]} />
        <meshStandardMaterial map={receiptB} roughness={0.95} />
      </mesh>

      <group position={[2.35, 1.0, 2.62]}>
        <mesh raycast={() => null} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.038, 0.008, 8, 18]} />
          <meshStandardMaterial color="#a49372" metalness={0.72} roughness={0.35} />
        </mesh>
        <SoftBox position={[0.065, 0, 0]} size={[0.09, 0.018, 0.026]} color="#8d7b5f" metalness={0.65} roughness={0.4} radius={0.006} />
      </group>

      <SoftBox position={[2.82, 0.995, 2.55]} size={[0.22, 0.045, 0.13]} color="#312d2a" rotation={[0, 0.18, 0]} radius={0.025} />
      <SoftBox position={[2.98, 0.08, 2.35]} size={[0.34, 0.14, 0.24]} color="#38383a" rotation={[0, -0.12, 0]} radius={0.04} />
      <SoftBox position={[2.62, 0.07, 2.3]} size={[0.33, 0.13, 0.22]} color="#2b2d30" rotation={[0, 0.17, 0]} radius={0.04} />

      <group position={[1.78, 1.72, 2.86]}>
        <SoftBox position={[0, 0, 0]} size={[0.055, 0.4, 0.055]} color="#27292b" radius={0.015} />
        <SoftBox position={[0, -0.25, -0.02]} size={[0.42, 0.45, 0.08]} color="#44484d" rotation={[0.04, 0, -0.07]} radius={0.045} />
      </group>

      <Decal texture={scuff} position={[1.1, 1.05, 2.936]} size={[0.78, 0.9]} opacity={0.62} />
      <Decal texture={scuff} position={[3.438, 0.55, 2.1]} size={[0.52, 0.62]} rotation={[0, -Math.PI / 2, 0]} opacity={0.48} />
    </group>
  )
}

export function InteriorRealismDetails() {
  const textures = useMemo(() => ({
    scuff: createDecalTexture('scuff'),
    damp: createDecalTexture('damp'),
    grease: createDecalTexture('grease'),
    rust: createDecalTexture('rust'),
    dust: createDecalTexture('dust'),
    coffee: createDecalTexture('coffee'),
    receiptA: createReceiptTexture('CONTAS', '€ 184,70'),
    receiptB: createReceiptTexture('AVISO', '€ 63,20'),
  }), [])

  useEffect(() => () => {
    Object.values(textures).forEach((texture) => texture.dispose())
  }, [textures])

  return (
    <group>
      <BedroomLivedIn scuff={textures.scuff} dust={textures.dust} />
      <BathroomLivedIn damp={textures.damp} rust={textures.rust} />
      <KitchenLivedIn grease={textures.grease} coffee={textures.coffee} />
      <HallwayLivedIn receiptA={textures.receiptA} receiptB={textures.receiptB} scuff={textures.scuff} />
    </group>
  )
}
