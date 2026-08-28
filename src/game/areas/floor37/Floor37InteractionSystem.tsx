import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findFloor37Interactable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.floor37InteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'final-order') return '[E] Ler ordem final'
  if (id === 'supply-cart') return '[E] Preparar materiais'
  if (id === 'window-panel') return '[E] Limpar vidro panorâmico'
  if (id === 'waste-bin') return '[E] Esvaziar lixeira'
  if (id === 'elevator-call') return '[E] Chamar elevador de serviço'
  return null
}

function markRoutineCompleteIfReady() {
  const game = useGameStore.getState()
  if (
    game.flags.floor37_routine_complete ||
    !game.flags.floor37_window_cleaned ||
    !game.flags.floor37_bin_emptied
  ) return

  game.setFlag('floor37_routine_complete')
  game.setCheckpoint('floor-37-complete', game.location.spawn)
  game.setObjective('Chame o elevador de serviço e encerre a rota.')
  game.say('Último andar concluído. Só chamar o elevador e ir embora.')
}

export function Floor37InteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const busy = useRef(false)
  const blackoutTimer = useRef<number | null>(null)

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
      const interactionFlag = `floor37_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `floor37:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'final-order') {
        game.triggerHandAction('reach', 680, target, id)
        if (!game.flags.floor37_final_order_read) game.setFlag('floor37_final_order_read')
        game.openNote(
          'ORDEM FINAL — 37.º ANDAR',
          'Fechamento da rota:\n\n• preparar os materiais no carrinho de apoio\n• limpar o vidro panorâmico do corredor leste\n• esvaziar a lixeira da sala executiva\n\nAo concluir, chamar o elevador de serviço e encerrar o turno.\n\nCORVUS FACILITIES — Procedimento 37-C.',
        )
        return
      }

      if (id === 'supply-cart') {
        game.triggerHandAction('grab', 900, target, id)
        if (!game.flags.floor37_supplies_ready) {
          game.setFlag('floor37_supplies_ready')
          game.setCheckpoint('floor-37-routine', game.location.spawn)
          game.setObjective('Conclua a rotina do 37.º: vidro e lixeira.')
          game.say('Materiais prontos. Vidro e lixeira.')
        } else {
          game.say('Materiais já estão prontos.')
        }
        return
      }

      if (id === 'window-panel') {
        game.triggerHandAction('reach', 980, target, id)
        if (!game.flags.floor37_supplies_ready) {
          game.say('Primeiro preciso preparar os materiais.')
          return
        }
        if (!game.flags.floor37_window_cleaned) {
          game.setFlag('floor37_window_cleaned')
          game.say('Vidro limpo.')
          markRoutineCompleteIfReady()
        } else {
          game.say('Já está limpo.')
        }
        return
      }

      if (id === 'waste-bin') {
        game.triggerHandAction('grab', 860, target, id)
        if (!game.flags.floor37_supplies_ready) {
          game.say('Primeiro preparo o carrinho.')
          return
        }
        if (!game.flags.floor37_bin_emptied) {
          game.setFlag('floor37_bin_emptied')
          game.say('Lixeira vazia.')
          markRoutineCompleteIfReady()
        } else {
          game.say('Já esvaziei essa lixeira.')
        }
        return
      }

      if (id === 'elevator-call') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.floor37_routine_complete) {
          const missing: string[] = []
          if (!game.flags.floor37_supplies_ready) missing.push('preparar os materiais')
          if (!game.flags.floor37_window_cleaned) missing.push('limpar o vidro')
          if (!game.flags.floor37_bin_emptied) missing.push('esvaziar a lixeira')
          game.say(`Ainda falta ${missing.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`)
          return
        }
        if (game.flags.floor37_blackout_triggered) return

        busy.current = true
        game.setFlag('floor37_elevator_called')
        game.setFlag('floor37_blackout_triggered')
        game.setCheckpoint('floor-37-blackout', game.location.spawn)
        game.setObjective('')
        game.triggerScare(1200)
        game.setBlackout(true)

        blackoutTimer.current = window.setTimeout(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'floor-37') return
          latest.requestAreaTransition(
            'blackout',
            'knocked-out',
            { x: 0, y: 1.35, z: 0, yaw: Math.PI },
            1000,
          )
        }, 850)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (blackoutTimer.current !== null) window.clearTimeout(blackoutTimer.current)
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
      game.demoEnded ||
      game.flags.floor37_blackout_triggered
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
      const id = findFloor37Interactable(hit.object)
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
