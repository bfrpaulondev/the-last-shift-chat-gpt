import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { audioEngine } from './AudioEngine'
import { useGameStore } from '../state/gameStore'

interface AudioAmbienceProps {
  enabled: boolean
}

export function AudioAmbience({ enabled }: AudioAmbienceProps) {
  const { camera } = useThree()

  useEffect(() => {
    if (!enabled) {
      return
    }

    void audioEngine.init().then(() => {
      audioEngine.stopTitleNoise()
      audioEngine.startAmbience()
    }).catch(() => undefined)
  }, [enabled])

  useFrame(() => {
    if (!enabled) {
      return
    }

    const faucetFixed = useGameStore.getState().hasFlag('faucet_fixed')
    audioEngine.updateSpatialAudio(camera.position.x, camera.position.z, faucetFixed)
  })

  return null
}
