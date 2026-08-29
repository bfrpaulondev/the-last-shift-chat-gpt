import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'
import {
  BRUNO_NOTEBOOK_LINE,
  SHADOWBYTE_LINE,
  startNascimentoConversation,
} from './NascimentoSequence'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 3.25
const ELEVATOR_SPAWN = { x: 4.45, y: 1.65, z: -0.05, yaw: Math.PI / 2 }
const SECURITY_RETURN_SPAWN = { x: 0, y: 1.65, z: 5.2, yaw: Math.PI }

function findInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.areaKInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string, flags: Record<string, boolean>, subtitle: string | null): string | null {
  if (id === 'notebook') {
    if (flags.nascimento_dead && !flags.notebook_taken) return '[E] Pegar a caderneta'
    return null
  }
  if (id === 'nascimento') {
    if (!flags.nascimento_conversation_started) return '[E] Ajoelhar ao lado de Nascimento'
    if (!flags.nascimento_dead && subtitle === null) return '[E] Continuar a última conversa'
    if (flags.nascimento_dead && flags.notebook_taken && !flags.closed_eyes) return '[E] Fechar os olhos de Nascimento'
    return null
  }
  if (id === 'exit-glass') return '[E] Tentar abrir as portas de vidro'
  if (id === 'elevator-return' && flags.elevator_alone && !flags.elevator_riding) return '[E] Entrar no elevador de serviço'
  return null
}

export function NightLobbyInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const hitPoint = useRef(new THREE.Vector3())
  const timers = useRef<number[]>([])

  useEffect(() => {
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      timers.current.push(timer)
      return timer
    }

    const emitIndicator = (floor: number) => {
      window.dispatchEvent(new CustomEvent('lobby:elevator-indicator', { detail: { floor } }))
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
        event.repeat ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [hitPoint.current.x, hitPoint.current.y, hitPoint.current.z]
      const seenFlag = `area_k_seen_${id}`
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `area-k:${id}`,
        wasFirstTime: !game.flags[seenFlag],
      })
      game.setFlag(seenFlag)

      if (id === 'nascimento') {
        if (!game.flags.nascimento_dead) {
          const firstContact = !game.flags.nascimento_conversation_started
          if (firstContact) {
            game.adjustBpm(15)
            game.setCheckpoint('night-lobby-nascimento', game.location.spawn)
          }
          startNascimentoConversation()
          return
        }

        if (game.flags.notebook_taken && !game.flags.closed_eyes) {
          game.setCinematic(true)
          game.triggerHandAction('reach', 900, target, 'nascimento-eyes')
          schedule(() => {
            const latest = useGameStore.getState()
            if (latest.location.area !== 'descent-lobby') return
            latest.setFlag('closed_eyes')
            latest.setCinematic(false)
            latest.logEvent({
              t: performance.now() / 1000,
              type: 'interact',
              objectId: 'area-k:closed-eyes',
              wasFirstTime: true,
            })
          }, 900)
        }
        return
      }

      if (id === 'notebook') {
        if (!game.flags.nascimento_dead || game.flags.notebook_taken || game.flags.notebook_transfer_started) return
        game.setFlag('notebook_transfer_started')
        game.setCinematic(true)
        game.triggerHandAction('grab', 1500, target, 'nascimento-notebook')
        window.dispatchEvent(new Event('lobby:notebook-transfer'))

        schedule(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'descent-lobby') return
          latest.setFlag('notebook_taken')
          latest.setCheckpoint('night-lobby-notebook-taken', latest.location.spawn)
          latest.setCinematic(false)
          latest.setObjective('Ouça o rádio de Nascimento.')
          latest.setFlag('shadowbyte_contact_1')
          latest.setFlag('shadowbyte_dialogue_started')
          window.dispatchEvent(new Event('lobby:shadowbyte-radio'))
          latest.say(SHADOWBYTE_LINE)
          latest.say(BRUNO_NOTEBOOK_LINE)
        }, 1550)
        return
      }

      if (id === 'exit-glass') {
        game.triggerHandAction('door', 850, target, id, 'door-handle')
        game.setFlag('exit_locked')
        game.openNote(
          'PORTAS DO LOBBY',
          'MODO RESTRITO — ACESSO EXTERNO BLOQUEADO — CENTRAL DE MONITORAMENTO NOTIFICADA',
        )
        game.queueSubtitle('Trancados juntos, então. Ele e eu.')
        return
      }

      if (id === 'elevator-return') {
        if (!game.flags.elevator_alone || game.flags.elevator_riding) return
        game.setFlag('elevator_riding')
        game.setCheckpoint('elevator-return', ELEVATOR_SPAWN)
        game.setCinematic(true)
        game.setObjective('Suba ao 39.º andar.')
        window.dispatchEvent(new Event('lobby:elevator-ride'))
        emitIndicator(0)

        schedule(() => emitIndicator(7), 700)
        schedule(() => emitIndicator(13), 1400)
        schedule(() => {
          emitIndicator(13)
          useGameStore.getState().setFlag('elevator_pause_13')
        }, 1900)
        schedule(() => emitIndicator(21), 2600)
        schedule(() => emitIndicator(30), 3400)
        schedule(() => {
          emitIndicator(39)
          const latest = useGameStore.getState()
          latest.setFlag('elevator_returned_39')
          window.dispatchEvent(new Event('lobby:elevator-ding'))
        }, 4300)
        schedule(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'descent-lobby') return
          latest.requestAreaTransition(
            'security-center',
            'security-center-return',
            SECURITY_RETURN_SPAWN,
            1100,
          )
        }, 5000)
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
      const id = findInteractable(hit.object)
      if (!id) continue
      const prompt = promptFor(id, game.flags, game.subtitle)
      if (!prompt) continue
      next = id
      hitPoint.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }

    if (!next) game.setPrompt(null)
    currentId.current = next
  })

  return null
}
