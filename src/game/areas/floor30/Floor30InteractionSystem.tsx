import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findFloor30Interactable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.floor30InteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'service-sheet') return '[E] Ler folha de serviço'
  if (id === 'supply-station') return '[E] Repor estação de materiais'
  if (id === 'glass-panel') return '[E] Limpar divisória de vidro'
  if (id === 'elevator-return') return '[E] Voltar ao elevador de serviço'
  return null
}

function markRoutineCompleteIfReady() {
  const game = useGameStore.getState()
  if (game.flags.floor30_routine_complete || !game.flags.floor30_station_restocked || !game.flags.floor30_glass_cleaned) return

  game.setFlag('floor30_routine_complete')
  game.setCheckpoint('floor-30-complete', game.location.spawn)
  game.setObjective('Volte ao elevador de serviço. Próxima parada: refeitório.')
  game.say('30.º concluído. Hora do refeitório.')
}

export function Floor30InteractionSystem() {
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
      const interactionFlag = `floor30_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `floor30:${id}`, wasFirstTime })
      game.setFlag(interactionFlag)

      if (id === 'service-sheet') {
        game.triggerHandAction('reach', 680, target, id)
        if (!game.flags.floor30_service_sheet_read) game.setFlag('floor30_service_sheet_read')
        game.openNote(
          'FOLHA DE SERVIÇO — 30.º ANDAR',
          'Rotina do setor executivo:\n\n• repor consumíveis na estação de apoio\n• limpar a divisória de vidro da sala de reunião\n\nAo concluir, retornar ao elevador de serviço. Próxima parada: refeitório.',
        )
        return
      }

      if (id === 'supply-station') {
        game.triggerHandAction('grab', 900, target, id)
        if (!game.flags.floor30_station_restocked) {
          game.setFlag('floor30_station_restocked')
          game.setCheckpoint('floor-30-routine', game.location.spawn)
          game.setObjective('Conclua a rotina: limpe a divisória de vidro.')
          game.say('Consumíveis repostos. Falta o vidro.')
          markRoutineCompleteIfReady()
        } else {
          game.say('Estação já reposta.')
        }
        return
      }

      if (id === 'glass-panel') {
        game.triggerHandAction('reach', 980, target, id)
        if (!game.flags.floor30_station_restocked) {
          game.say('Primeiro preciso dos materiais da estação.')
          return
        }
        if (!game.flags.floor30_glass_cleaned) {
          game.setFlag('floor30_glass_cleaned')
          game.say('Vidro limpo.')
          markRoutineCompleteIfReady()
        } else {
          game.say('Já está limpo.')
        }
        return
      }

      if (id === 'elevator-return') {
        if (!game.flags.floor30_routine_complete) {
          game.triggerHandAction('door', 560, target, id, 'door-handle')
          const missing: string[] = []
          if (!game.flags.floor30_station_restocked) missing.push('repor a estação')
          if (!game.flags.floor30_glass_cleaned) missing.push('limpar o vidro')
          game.say(`Ainda falta ${missing.join(' e ')}.`)
          return
        }

        busy.current = true
        game.setFlag('floor30_left_for_elevator')
        game.triggerHandAction('door', 820, target, id, 'door-handle')
        game.requestAreaTransition(
          'service-elevator',
          'elevator-after-floor-30',
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
      const id = findFloor30Interactable(hit.object)
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
