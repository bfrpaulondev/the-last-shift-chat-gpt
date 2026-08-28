import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function PbrEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const previousEnvironment = scene.environment
    const previousIntensity = scene.environmentIntensity
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileCubemapShader()

    const room = new RoomEnvironment()
    const renderTarget = pmrem.fromScene(room, 0.045)
    room.dispose()

    scene.environment = renderTarget.texture
    scene.environmentIntensity = 0.34

    return () => {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousIntensity
      renderTarget.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}
