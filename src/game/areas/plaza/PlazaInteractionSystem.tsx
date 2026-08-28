import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findPlazaInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.plazaInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'tower-sign') return '[E] Observar a fachada'
  if (id === 'security-notice') return '[E] Ler aviso'
  if (id === 'lobby-door') return '[E] Entrar na Meridian Tower'
  return null
}

export function PlazaInteractionSystem() {
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
      const interactionFlag = `plaza_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `plaza:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'tower-sign') {
        game.triggerHandAction('brace', 650, target, id)
        game.say('MERIDIAN. De perto parece ainda maior.')
        return
      }

      if (id === 'security-notice') {
        game.triggerHandAction('reach', 650, target, id)
        game.openNote(
          'MERIDIAN — ACESSO DE SERVIÇO',
          'Funcionários terceirizados devem apresentar o crachá na portaria.\n\nAcesso aos andares técnicos somente pelo elevador de serviço.\n\nCORVUS FACILITIES — Procedimento 06-B.',
        )
        return
      }

      if (id === 'lobby-door') {
        busy.current = true
        game.setFlag('plaza_entered_tower')
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        game.requestAreaTransition(
          'lobby',
          'lobby-entry',
          { x: 0, y: 1.65, z: 4.8, yaw: Math.PI },
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
      const id = findPlazaInteractable(hit.object)
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
