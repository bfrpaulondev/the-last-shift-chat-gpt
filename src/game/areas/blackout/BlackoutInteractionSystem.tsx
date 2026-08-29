import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.9
const STANDING_SPAWN = { x: 0, y: 1.65, z: 2.2, yaw: Math.PI }
const STAIRWELL_ENTRY_SPAWN = { x: 0, y: 1.65, z: 4.8, yaw: Math.PI }
const NOTE_TEXT = `Boa noite, colega.

Sabe a diferença entre a gente?

Você limpa o que os olhos veem. Eu limpo o que o prédio esconde.

Hoje o prédio decidiu te devolver seu crachá. Digamos que vocês dois estão fora do expediente.

Você tem até o amanhecer para provar que é limpo.

Quem entrou duas vezes, só saiu uma. A resposta mora no porão.

— ShadowByte

P.S.: the building's clock lies sometimes. Check it.`

function findBlackoutInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.blackoutInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'shadow-note') return '[E] Pegar o bilhete'
  if (id === 'phone-37') return '[E] Ver celular'
  if (id === 'fallen-bucket') return '[E] Erguer balde'
  if (id === 'ceo-door-night') return '[E] Testar porta do CEO'
  if (id === 'door37-reader') return '[E] Tentar leitor da porta 37'
  if (id === 'emergency-route-door') return '[E] Entrar no corredor de emergência'
  if (id === 'wrist-pulse') return '[E] Sentir o próprio pulso'
  return null
}

export function BlackoutInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const lookDirection = useRef(new THREE.Vector3())
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      timers.current.push(timer)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (game.note) {
        if (event.code === 'KeyE' || event.code === 'Escape') game.closeNote()
        return
      }
      if (game.subtitle || game.subtitleQueue.length > 0) {
        if (event.code === 'Space' && game.subtitle) {
          event.preventDefault()
          game.dismissSubtitle()
        }
        return
      }
      if (
        event.defaultPrevented ||
        event.code !== 'KeyE' ||
        busy.current ||
        game.blackout ||
        game.cinematic ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return

      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `part3_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `awakening:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'shadow-note') {
        if (game.flags.note_read) return
        busy.current = true
        game.triggerHandAction('brace', 1550, target, id)
        game.setCinematic(true)

        schedule(() => {
          const latest = useGameStore.getState()
          if (latest.location.area === 'blackout') latest.setBlackout(true)
        }, 520)

        schedule(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'blackout') return
          latest.setFlag('note_read')
          latest.setFlag('badge_stolen')
          latest.setFlag('cup_missing')
          latest.setCheckpoint('awakening-note-read', STANDING_SPAWN)
          latest.setBlackout(false)
          latest.setCinematic(false)
          latest.openNote('BILHETE — SHADOWBYTE', NOTE_TEXT)
          busy.current = false
        }, 1040)
        return
      }

      if (!game.flags.note_read) return

      if (id === 'wrist-pulse') {
        game.triggerHandAction('brace', 900, undefined, id)
        return
      }

      if (id === 'phone-37') {
        game.triggerHandAction('grab', 900, target, 'phone', 'phone-lift')
        if (!game.flags.phone_37_night_checked) {
          game.setFlag('phone_37_night_checked')
          game.setCheckpoint('awakening-phone-checked', game.location.spawn)
        }
        game.say('4%. Sem sinal.')
        return
      }

      if (id === 'fallen-bucket') {
        game.triggerHandAction('grab', 820, target, id)
        if (!game.flags.bucket_night_lifted) game.setFlag('bucket_night_lifted')
        return
      }

      if (id === 'ceo-door-night') {
        game.triggerHandAction('door', 850, target, id, 'door-handle')
        if (!game.flags.ceo_door_night) game.setFlag('ceo_door_night')
        return
      }

      if (id === 'door37-reader') {
        game.triggerHandAction('reach', 920, target, id)
        if (!game.flags.door37_locked) {
          game.setFlag('door37_locked')
          game.setCheckpoint('awakening-door37-locked', game.location.spawn)
          game.say('Trancada. Do lado de fora. Com o MEU crachá.')
        }
        return
      }

      if (id === 'emergency-route-door') {
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        if (!game.flags.door37_locked) return
        if (!game.flags.blackout_left_for_stairwell) game.setFlag('blackout_left_for_stairwell')
        game.requestAreaTransition(
          'emergency-stairwell',
          'stairwell-floor-37',
          STAIRWELL_ENTRY_SPAWN,
          1050,
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
    }
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    if (
      game.blackout ||
      game.note ||
      game.subtitle ||
      game.subtitleQueue.length > 0 ||
      game.cinematic ||
      game.areaTransition ||
      game.demoEnded
    ) {
      currentId.current = null
      game.setPrompt(null)
      return
    }

    raycaster.current.setFromCamera(CENTER, camera)
    raycaster.current.far = RANGE
    const hits = raycaster.current.intersectObjects(scene.children, true)
    let next: string | null = null

    for (const hit of hits) {
      if (hit.distance > RANGE) break
      const id = findBlackoutInteractable(hit.object)
      if (!id) continue
      if (!game.flags.note_read && id !== 'shadow-note') continue
      if (id === 'shadow-note' && game.flags.note_read) continue
      if (id === 'emergency-route-door' && !game.flags.door37_locked) continue
      const prompt = promptFor(id)
      if (!prompt) continue
      next = id
      point.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }

    if (!next && game.flags.note_read) {
      camera.getWorldDirection(lookDirection.current)
      if (lookDirection.current.y < -0.62) {
        next = 'wrist-pulse'
        point.current.copy(camera.position)
        game.setPrompt(promptFor(next))
      }
    }

    if (!next) game.setPrompt(null)
    currentId.current = next
  })

  return null
}
