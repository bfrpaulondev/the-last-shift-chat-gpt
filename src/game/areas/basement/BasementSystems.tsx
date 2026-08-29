import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const DRAIN_INTERVAL_MS = 90_000
const CHARGE_INTERVAL_MS = 300_000
const OUTLET = new THREE.Vector3(0.9, 0.9, -1.1)

export function BasementSystems() {
  const { camera, scene } = useThree()
  const lastCamera = useRef(camera.position.clone())
  const lastMovingAt = useRef(performance.now())
  const lastBpmTick = useRef(performance.now())
  const charging = useRef(false)
  const chargeStartedAt = useRef(0)
  const wetStepsTimer = useRef<number | null>(null)
  const circuitTimer = useRef<number | null>(null)
  const staticTimer = useRef<number | null>(null)

  useEffect(() => {
    const game = useGameStore.getState()
    game.setFlag('part4_started')
    game.setBpm(Math.max(game.bpm, game.flags.choice_basement_now ? 120 : 105))
    game.setFlashlightOn(game.phoneBattery > 0)

    const drainTimer = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.location.area !== 'basement' || !state.flashlightOn || state.phoneBattery <= 0) return
      state.adjustPhoneBattery(-1)
      state.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'basement:battery-drain',
        wasFirstTime: !state.flags.battery_drain_seen,
      })
      if (!state.flags.battery_drain_seen) state.setFlag('battery_drain_seen')
      if (useGameStore.getState().phoneBattery <= 0) {
        state.say('A lanterna morreu. O telefone também.')
        window.dispatchEvent(new Event('basement:flashlight-dead'))
      }
    }, DRAIN_INTERVAL_MS)

    const onChargeStart = () => {
      charging.current = true
      chargeStartedAt.current = performance.now()
      useGameStore.getState().setFlashlightOn(false)
    }
    const onChargeStop = () => {
      charging.current = false
      chargeStartedAt.current = 0
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyF' || event.repeat) return
      const state = useGameStore.getState()
      if (state.location.area !== 'basement' || state.cinematic || state.note) return
      if (state.phoneBattery <= 0) {
        state.say('Zero por cento.')
        return
      }
      charging.current = false
      state.setFlashlightOn(!state.flashlightOn)
      state.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: state.flashlightOn ? 'basement:flashlight-off' : 'basement:flashlight-on',
        wasFirstTime: false,
      })
    }

    window.addEventListener('basement:charging-start', onChargeStart)
    window.addEventListener('basement:charging-stop', onChargeStop)
    window.addEventListener('keydown', onKeyDown)

    wetStepsTimer.current = window.setTimeout(() => {
      const state = useGameStore.getState()
      if (state.location.area !== 'basement' || state.flags.wet_steps_b1) return
      state.setFlag('wet_steps_b1')
      window.dispatchEvent(new Event('basement:wet-steps'))
    }, 48_000 + Math.random() * 32_000)

    circuitTimer.current = window.setTimeout(() => {
      const state = useGameStore.getState()
      if (state.location.area !== 'basement') return
      state.setFlag('basement_circuit_drop')
      window.dispatchEvent(new Event('basement:circuit-drop'))
    }, 72_000 + Math.random() * 48_000)

    staticTimer.current = window.setTimeout(() => {
      const state = useGameStore.getState()
      if (state.location.area !== 'basement') return
      state.setFlag('basement_monitor_static')
      window.dispatchEvent(new Event('basement:monitor-static'))
    }, 115_000 + Math.random() * 55_000)

    return () => {
      window.clearInterval(drainTimer)
      if (wetStepsTimer.current !== null) window.clearTimeout(wetStepsTimer.current)
      if (circuitTimer.current !== null) window.clearTimeout(circuitTimer.current)
      if (staticTimer.current !== null) window.clearTimeout(staticTimer.current)
      window.removeEventListener('basement:charging-start', onChargeStart)
      window.removeEventListener('basement:charging-stop', onChargeStop)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useFrame(() => {
    const now = performance.now()
    const movement = camera.position.distanceTo(lastCamera.current)
    if (movement > 0.006) {
      lastMovingAt.current = now
      lastCamera.current.copy(camera.position)
      if (charging.current) {
        charging.current = false
        chargeStartedAt.current = 0
        window.dispatchEvent(new Event('basement:charging-stop'))
      }
    }

    if (charging.current) {
      const closeEnough = camera.position.distanceTo(OUTLET) < 2.2
      const stationary = now - lastMovingAt.current > 1_800
      if (!closeEnough || !stationary) {
        if (!closeEnough) {
          charging.current = false
          chargeStartedAt.current = 0
        }
      } else if (now - chargeStartedAt.current >= CHARGE_INTERVAL_MS) {
        const game = useGameStore.getState()
        game.adjustPhoneBattery(1)
        game.setFlag('charged_in_dark')
        game.say('Mais um por cento.')
        chargeStartedAt.current = now
        window.dispatchEvent(new Event('basement:charge-tick'))
      }
    }

    if (now - lastBpmTick.current < 1000) return
    lastBpmTick.current = now
    const game = useGameStore.getState()
    const cat = scene.getObjectByName('judas-cat')
    const catDistance = cat ? camera.position.distanceTo(cat.position) : Infinity
    const closeToCat = catDistance <= 3

    if (closeToCat) {
      game.setBpm(Math.max(72, game.bpm - 6))
      return
    }

    const floor = game.flashlightOn ? 88 : 95
    if (game.bpm < floor) game.setBpm(floor)
    else if (game.bpm > floor + 8) game.adjustBpm(-1)
  })

  return null
}
