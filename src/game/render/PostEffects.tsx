import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

export function PostEffects() {
  const { gl, scene, camera, size } = useThree()

  const composer = useMemo(() => {
    const nextComposer = new EffectComposer(gl)
    nextComposer.addPass(new RenderPass(scene, camera))

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.16,
      0.28,
      0.88,
    )
    nextComposer.addPass(bloom)

    const fxaa = new ShaderPass(FXAAShader)
    nextComposer.addPass(fxaa)
    nextComposer.addPass(new OutputPass())
    return nextComposer
  }, [camera, gl, scene])

  useEffect(() => {
    const pixelRatio = gl.getPixelRatio()
    composer.setSize(size.width, size.height)

    const fxaa = composer.passes.find(
      (pass): pass is ShaderPass => pass instanceof ShaderPass,
    )
    fxaa?.material.uniforms.resolution.value.set(
      1 / (size.width * pixelRatio),
      1 / (size.height * pixelRatio),
    )
  }, [composer, gl, size.height, size.width])

  useEffect(() => () => composer.dispose(), [composer])

  useFrame(() => {
    composer.render()
  }, 1)

  return null
}
