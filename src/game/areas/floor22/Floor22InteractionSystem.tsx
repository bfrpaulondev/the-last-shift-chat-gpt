import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findFloor22Interactable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.floor22InteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'work-order') return '[E] Ler ordem de serviço'
  if (id === 'cleaning-cart') return '[E] Preparar carrinho'
  if (id === 'spill') return '[E] Limpar derramamento'
  if (id === 'waste-bin') return '[E] Esvaziar lixeira'
  if (id === 'elevator-return') return '[E] Voltar ao elevador de serviço'
  return null
}

function markRoutineCompleteIfReady() {
  const game = useGameStore.getState()
  if (
    game.flags.floor22_routine_complete ||
    !game.flags.floor22_spill_cleaned ||
    !game.flags.floor22_waste_emptied
  ) {
    return
  }

  game.setFlag('floor22_routine_complete')
  game.setCheckpoint('floor-22-complete', game.location.spawn)
  game.setObjective('Volte ao elevador de serviço. Próximo destino: 30.º andar.')
  game.say('22.º concluído. Próximo: 30.º.')
}

export function Floor22InteractionSystem() {
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
      const interactionFlag = `floor22_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `floor22:${id}`, wasFirstTime })
      game.setFlag(interactionFlag)

      if (id === 'work-order') {
        game.triggerHandAction('reach', 680, target, id)
        if (!game.flags.floor22_work_order_read) game.setFlag('floor22_work_order_read')
        game.openNote(
          'ORDEM DE SERVIÇO — 22.º ANDAR',
          'Rotina inicial:\n\n• preparar o carrinho de limpeza\n• remover o derramamento no corredor\n• esvaziar a lixeira do posto oeste\n\nAo concluir, retornar ao elevador de serviço. Próximo setor: 30.º andar.',
        )
        return
      }

      if (id === 'cleaning-cart') {
        game.triggerHandAction('grab', 820, target, id)
        if (!game.flags.floor22_cart_ready) {
          game.setFlag('floor22_cart_ready')
          game.setCheckpoint('floor-22-routine', game.location.spawn)
          game.setObjective('Conclua a rotina: limpe o derramamento e esvazie a lixeira.')
          game.say('Carrinho pronto. Derramamento e lixeira.')
        } else {
          game.say('Carrinho já está pronto.')
        }
        return
      }

      if (id === 'spill') {
        game.triggerHandAction('reach', 980, target, id)
        if (!game.flags.floor22_cart_ready) {
          game.say('Preciso preparar o carrinho primeiro.')
          return
        }
        if (!game.flags.floor22_spill_cleaned) {
          game.setFlag('floor22_spill_cleaned')
          game.say('Corredor limpo.')
          markRoutineCompleteIfReady()
        }
        return
      }

      if (id === 'waste-bin') {
        game.triggerHandAction('grab', 900, target, id)
        if (!game.flags.floor22_cart_ready) {
          game.say('Sem saco e material do carrinho, não.')
          return
        }
        if (!game.flags.floor22_waste_emptied) {
          game.setFlag('floor22_waste_emptied')
          game.say('Lixeira feita.')
          markRoutineCompleteIfReady()
        } else {
          game.say('Já esvaziei esta.')
        }
        return
      }

      if (id === 'elevator-return') {
        if (!game.flags.floor22_routine_complete) {
          game.triggerHandAction('door', 560, target, id, 'door-handle')
          const missing: string[] = []
          if (!game.flags.floor22_spill_cleaned) missing.push('o derramamento')
          if (!game.flags.floor22_waste_emptied) missing.push('a lixeira')
          game.say(`Ainda falta ${missing.join(' e ')}.`)
          return
        }

        busy.current = true
        game.setFlag('floor22_left_for_elevator')
        game.triggerHandAction('door', 820, target, id, 'door-handle')
        game.requestAreaTransition(
          'service-elevator',
          'elevator-after-floor-22',
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
      const id = findFloor22Interactable(hit.object)
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
