import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8
const LOWER_LANDING_SPAWN = { x: 0, y: 1.65, z: -4.8, yaw: 0 }

function findStairwellInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.stairwellInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'emergency-plan') return '[E] Ler mapa de emergência'
  if (id === 'upper-descent') return '[E] Descer para o patamar inferior'
  if (id === 'emergency-phone') return '[E] Testar telefone de emergência'
  if (id === 'lower-descent') return '[E] Continuar descendo'
  return null
}

export function StairwellInteractionSystem() {
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
      const interactionFlag = `stairwell_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `stairwell:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'emergency-plan') {
        game.triggerHandAction('reach', 680, target, id)
        if (!game.flags.stairwell_plan_read) game.setFlag('stairwell_plan_read')
        game.openNote(
          'ROTA DE EMERGÊNCIA — TORRE MERIDIAN',
          'FALHA DE ENERGIA\n\n• não utilizar elevadores\n• manter portas corta-fogo fechadas\n• seguir pela escada de emergência até um nível seguro\n• telefones de emergência podem operar em circuito independente\n\nCORVUS FACILITIES — PLANO E-04.',
        )
        return
      }

      if (id === 'upper-descent') {
        if (!game.flags.blackout_recovery_complete) {
          game.say('Preciso voltar pela porta corta-fogo.')
          return
        }
        if (game.flags.stairwell_first_descent) {
          game.say('Já desci este lance.')
          return
        }

        busy.current = true
        game.triggerHandAction('brace', 980, target, id)
        game.setFlag('stairwell_first_descent')
        game.setCheckpoint('stairwell-lower-landing', LOWER_LANDING_SPAWN)
        game.setObjective('Verifique o patamar inferior e continue pela rota de emergência.')
        game.requestAreaTransition(
          'emergency-stairwell',
          'stairwell-lower-landing',
          LOWER_LANDING_SPAWN,
          1050,
        )
        return
      }

      if (id === 'emergency-phone') {
        game.triggerHandAction('grab', 900, target, id, 'phone-lift')
        if (!game.flags.stairwell_first_descent) {
          game.say('O telefone fica no patamar inferior.')
          return
        }
        if (game.flags.stairwell_phone_checked) {
          game.say('Ainda sem linha.')
          return
        }

        game.setFlag('stairwell_phone_checked')
        game.setCheckpoint('stairwell-phone-dead', game.location.spawn)
        game.setObjective('Continue descendo pela escada de emergência.')
        game.say('Sem linha. Nem o circuito de emergência responde.')
        return
      }

      if (id === 'lower-descent') {
        game.triggerHandAction('door', 860, target, id, 'door-handle')
        if (!game.flags.stairwell_first_descent) return
        if (!game.flags.stairwell_phone_checked) {
          game.say('Antes, vou tentar o telefone de emergência.')
          return
        }
        if (game.flags.stairwell_route_complete) {
          game.say('Só há um caminho: continuar descendo.')
          return
        }

        game.setFlag('stairwell_route_complete')
        game.setCheckpoint('stairwell-route-ready', game.location.spawn)
        game.setObjective('Continue descendo — próximo patamar.')
        game.say('Nada lá em cima. Tenho que continuar descendo.')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
      const id = findStairwellInteractable(hit.object)
      if (!id) continue
      if (id === 'upper-descent' && game.flags.stairwell_first_descent) continue
      if ((id === 'emergency-phone' || id === 'lower-descent') && !game.flags.stairwell_first_descent) continue
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
