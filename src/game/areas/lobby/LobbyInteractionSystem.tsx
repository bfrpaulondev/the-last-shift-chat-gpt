import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findLobbyInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.lobbyInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'security-desk') return '[E] Falar na portaria'
  if (id === 'badge-reader') return '[E] Apresentar crachá'
  if (id === 'directory') return '[E] Consultar diretório'
  if (id === 'b1-door') return '[E] Ir para o vestiário B1'
  return null
}

export function LobbyInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const busy = useRef(false)

  useEffect(() => {
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
        game.cinematic ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `lobby_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `lobby:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'security-desk') {
        game.triggerHandAction('brace', 650, target, id)
        if (game.flags.lobby_badge_verified) {
          game.say('B1 primeiro. Depois, elevador de serviço.')
        } else {
          game.say('O leitor. Crachá 4471.')
        }
        return
      }

      if (id === 'badge-reader') {
        game.triggerHandAction('press', 900, target, id)
        if (!game.flags.badge_taken) {
          game.say('Sem o crachá eu não passo daqui.')
          return
        }
        if (!game.flags.lobby_badge_verified) {
          game.setFlag('lobby_badge_verified')
          game.setCheckpoint('lobby-badge-verified', game.location.spawn)
          game.say('4471. Liberado.')
          game.say('Vestiário B1. Depois, elevador de serviço.')
        } else {
          game.say('Acesso já liberado.')
        }
        return
      }

      if (id === 'directory') {
        game.triggerHandAction('reach', 650, target, id)
        game.openNote(
          'MERIDIAN TOWER — DIRETÓRIO DE SERVIÇO',
          'B1 — Vestiários / armários de funcionários\n\nTérreo — Portaria e controle de acesso\n\nAndares técnicos — acesso exclusivo pelo elevador de serviço\n\nCORVUS FACILITIES — Procedimento 06-B.',
        )
        return
      }

      if (id === 'b1-door') {
        if (!game.flags.lobby_badge_verified) {
          game.triggerHandAction('door', 620, target, id, 'door-handle')
          game.say('Trancada. Tenho que validar o crachá na portaria.')
          return
        }
        busy.current = true
        game.setFlag('lobby_left_for_b1')
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        game.requestAreaTransition(
          'locker-b1',
          'locker-entry',
          { x: 0, y: 1.65, z: 4.2, yaw: Math.PI },
          1250,
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    if (game.note || game.subtitle || game.subtitleQueue.length > 0 || game.cinematic || game.areaTransition || game.demoEnded) {
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
      const id = findLobbyInteractable(hit.object)
      if (!id) continue
      const prompt = promptFor(id)
      if (!prompt) continue
      next = id
      point.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }

    if (!next) game.setPrompt(null)
    currentId.current = next
  })

  return null
}
