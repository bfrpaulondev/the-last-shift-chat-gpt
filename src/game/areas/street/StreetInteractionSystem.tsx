import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.45
const BUS_BOARDING_RANGE = 3.25

type StreetInteractable = 'route-214' | 'corvus-flyer' | 'tower-puddle' | 'bus-door'

function findStreetInteractable(object: THREE.Object3D | null): StreetInteractable | null {
  let current = object
  while (current) {
    const value = current.userData.streetInteractableId
    if (
      value === 'route-214' ||
      value === 'corvus-flyer' ||
      value === 'tower-puddle' ||
      value === 'bus-door'
    ) {
      return value
    }
    current = current.parent
  }
  return null
}

function promptFor(id: StreetInteractable, flags: Record<string, boolean>): string | null {
  switch (id) {
    case 'route-214':
      return '[E] Ver horários da linha 214'
    case 'corvus-flyer':
      return '[E] Pegar o panfleto molhado'
    case 'tower-puddle':
      return '[E] Observar o reflexo'
    case 'bus-door':
      return flags.bus_arrived ? '[E] Embarcar no 214' : null
  }
}

function rangeFor(id: StreetInteractable): number {
  return id === 'bus-door' ? BUS_BOARDING_RANGE : RANGE
}

export function StreetInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const current = useRef<StreetInteractable | null>(null)
  const hitPoint = useRef(new THREE.Vector3())
  const busy = useRef(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useGameStore.getState()

      if (state.note) {
        if (event.code === 'KeyE' || event.code === 'Escape') state.closeNote()
        return
      }
      if (state.subtitle || state.subtitleQueue.length > 0) {
        if (event.code === 'Space' && state.subtitle) {
          event.preventDefault()
          state.dismissSubtitle()
        }
        return
      }
      if (event.code !== 'KeyE' || busy.current || state.cinematic || state.areaTransition) return

      const id = current.current
      if (!id) return

      const target: [number, number, number] = [hitPoint.current.x, hitPoint.current.y, hitPoint.current.z]
      state.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `street:${id}`,
        wasFirstTime: !state.flags[`street_interacted_${id}`],
      })
      state.setFlag(`street_interacted_${id}`)

      if (id === 'route-214') {
        busy.current = true
        state.triggerHandAction('reach', 760, target, id)
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          latest.setFlag('route_214_checked')
          latest.openNote(
            'LINHA 214 — BAIRRO NORTE / AV. MERIDIAN',
            '05:20 · 05:35 · 05:50 · 06:05 · 06:20 · 06:35\n\n06:05 — MERIDIAN\n\nHorários sujeitos ao trânsito e à chuva.',
          )
          busy.current = false
        }, 620)
        return
      }

      if (id === 'corvus-flyer') {
        busy.current = true
        state.triggerHandAction('grab', 900, target, id)
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          latest.setFlag('corvus_flyer_seen')
          latest.openNote(
            'CORVUS FACILITY GROUP',
            'AUX. DE LIMPEZA\n\nTurnos flexíveis · início imediato\nPrédios corporativos e logística\n\n“Você cuida do que ninguém vê.”',
          )
          busy.current = false
        }, 720)
        return
      }

      if (id === 'tower-puddle') {
        state.triggerHandAction('brace', 850, target, id)
        state.setFlag('meridian_puddle_seen')
        state.say('Um prédio que só existe de cabeça pra baixo nas poças. Igual a muita gente.')
        return
      }

      if (id === 'bus-door' && state.flags.bus_arrived) {
        busy.current = true
        state.setCinematic(true)
        state.triggerHandAction('press', 1050, target, 'bus-validator')
        audioEngine.playDoorUnlock()
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          latest.setFlag('bus_boarded')
          useShiftClock.getState().setWorldMinute(365)
          latest.requestAreaTransition(
            'bus-214',
            'bus-boarded',
            { x: 0, y: 1.65, z: 1.55, yaw: Math.PI },
            1300,
          )
          busy.current = false
        }, 680)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const state = useGameStore.getState()
    if (state.note || state.subtitle || state.cinematic || state.areaTransition || state.demoEnded) {
      current.current = null
      state.setPrompt(null)
      return
    }

    raycaster.current.setFromCamera(CENTER, camera)
    raycaster.current.far = BUS_BOARDING_RANGE
    const hits = raycaster.current.intersectObjects(scene.children, true)
    let next: StreetInteractable | null = null

    for (const hit of hits) {
      if (hit.distance > BUS_BOARDING_RANGE) break
      const id = findStreetInteractable(hit.object)
      if (!id || hit.distance > rangeFor(id)) continue
      const prompt = promptFor(id, state.flags)
      if (!prompt) continue
      next = id
      hitPoint.current.copy(hit.point)
      state.setPrompt(prompt)
      break
    }

    if (!next) state.setPrompt(null)
    current.current = next
  })

  return null
}
