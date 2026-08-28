import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findCafeteriaInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.cafeteriaInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'break-notice') return '[E] Ler aviso de pausa'
  if (id === 'coffee-machine') return '[E] Preparar café'
  if (id === 'break-seat') return '[E] Fazer a pausa'
  if (id === 'elevator-return') return '[E] Voltar ao elevador de serviço'
  return null
}

function completeBreakIfReady() {
  const game = useGameStore.getState()
  if (game.flags.cafeteria_break_complete || !game.flags.cafeteria_coffee_taken || !game.flags.cafeteria_break_taken) return

  game.setFlag('cafeteria_break_complete')
  game.setCheckpoint('cafeteria-complete', game.location.spawn)
  game.setObjective('Volte ao elevador de serviço. Próxima parada: 37.º andar.')
  game.say('Pausa feita. Falta o 37.º.')
}

export function CafeteriaInteractionSystem() {
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
      if (event.defaultPrevented || event.code !== 'KeyE' || busy.current || game.cinematic || game.areaTransition || game.demoEnded) return

      const id = currentId.current
      if (!id) return

      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `cafeteria_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `cafeteria:${id}`, wasFirstTime })
      game.setFlag(interactionFlag)

      if (id === 'break-notice') {
        game.triggerHandAction('reach', 650, target, id)
        game.setFlag('cafeteria_notice_read')
        game.openNote(
          'PAUSA OPERACIONAL — CORVUS FACILITIES',
          'Intervalo curto autorizado após o 30.º andar.\n\nUse a estação de café, faça a pausa e retome a rota pelo elevador de serviço.\n\nÚltima parada da sequência: 37.º andar.',
        )
        return
      }

      if (id === 'coffee-machine') {
        game.triggerHandAction('press', 900, target, id)
        if (!game.flags.cafeteria_coffee_taken) {
          game.setFlag('cafeteria_coffee_taken')
          game.setCheckpoint('cafeteria-break', game.location.spawn)
          game.setObjective('Faça a pausa antes de voltar ao elevador.')
          game.say('Café. Dois minutos.')
          completeBreakIfReady()
        } else {
          game.say('Já peguei café.')
        }
        return
      }

      if (id === 'break-seat') {
        game.triggerHandAction('brace', 900, target, id)
        if (!game.flags.cafeteria_coffee_taken) {
          game.say('Primeiro um café.')
          return
        }
        if (!game.flags.cafeteria_break_taken) {
          game.setFlag('cafeteria_break_taken')
          game.say('Só mais um andar.')
          completeBreakIfReady()
        } else {
          game.say('Pausa concluída.')
        }
        return
      }

      if (id === 'elevator-return') {
        if (!game.flags.cafeteria_break_complete) {
          game.triggerHandAction('door', 560, target, id, 'door-handle')
          game.say('Ainda não terminei a pausa.')
          return
        }

        busy.current = true
        game.setFlag('cafeteria_left_for_elevator')
        game.triggerHandAction('door', 820, target, id, 'door-handle')
        game.requestAreaTransition(
          'service-elevator',
          'elevator-after-cafeteria',
          { x: 0, y: 1.65, z: 1.2, yaw: Math.PI },
          1200,
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
      const id = findCafeteriaInteractable(hit.object)
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
