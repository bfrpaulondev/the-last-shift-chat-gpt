import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../../audio/AudioEngine'
import { useGameStore } from '../../state/gameStore'
import { useShiftClock } from '../../time/shiftClock'
import { useBusTriageStore } from './busTriageStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.65
const HOLD_SECONDS = 0.8

const TRIAGE_CANDIDATES = new Set([
  'passenger-book',
  'passenger-sleeper',
  'passenger-executive',
  'passenger-cap',
])

function findBusInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.busInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string, flags: Record<string, boolean>): string | null {
  const triage = useBusTriageStore.getState()
  if (triage.pinPhase === 'active') return null
  if (triage.triagePhase === 'alert' && TRIAGE_CANDIDATES.has(id)) {
    return '[E] SEGURAR — MARCAR'
  }
  if (id === 'gossip-colleagues') return '[E] Ouvir a conversa'
  if (id === 'passenger-book' && !flags.bus_book_seen) return '[E] Observar o livro'
  if (id === 'passenger-paulo' && !flags.paulo_seen) return '[E] Observar'
  if (id === 'stop-bell') return flags.stop_requested ? null : '[E] Solicitar parada'
  if (id === 'bus-exit') return flags.meridian_stop_ready ? '[E] Descer do ônibus' : null
  return null
}

export function BusInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const interactionPoint = useRef(new THREE.Vector3())
  const holding = useRef(false)
  const gossipObject = useRef<THREE.Object3D | null>(null)

  const classifyCandidate = (id: string) => {
    const bus = useBusTriageStore.getState()
    const game = useGameStore.getState()
    holding.current = false
    bus.setMarkProgress(0)

    if (id === 'passenger-cap') {
      game.setFlag('caught_pickpocket')
      game.setFlag('bus_alert_completed')
      bus.resolveAlert(true)
      window.setTimeout(() => {
        const latest = useGameStore.getState()
        latest.say('Ele não estava olhando a rua. Estava olhando as mochilas.')
      }, 420)
      window.setTimeout(() => {
        useGameStore.getState().setFlag('pickpocket_left_bus')
      }, 4200)
      return
    }

    game.setFlag(`triage_checked_${id}`)
    bus.setFeedback('PADRÃO COMPATÍVEL.', 950)
  }

  useEffect(() => {
    scene.traverse((object) => {
      if (!gossipObject.current && object.userData.busInteractableId === 'gossip-colleagues') {
        gossipObject.current = object
      }
    })

    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()
      const bus = useBusTriageStore.getState()

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
      if (event.code !== 'KeyE' || game.cinematic || game.areaTransition || game.demoEnded) return
      if (bus.pinPhase === 'active') return

      const id = currentId.current
      if (!id) return

      if (bus.triagePhase === 'alert' && TRIAGE_CANDIDATES.has(id)) {
        holding.current = true
        bus.setFocusedCandidate(id)
        return
      }

      const target: [number, number, number] = [
        interactionPoint.current.x,
        interactionPoint.current.y,
        interactionPoint.current.z,
      ]

      if (id === 'gossip-colleagues') {
        if (bus.gossipDistance > 2.5) return
        if (game.flags.overheard_corvus) {
          game.say('As duas voltam a falar baixo quando percebem movimento no corredor.')
          return
        }
        game.setFlag('overheard_corvus')
        game.triggerHandAction('brace', 700, target, id)
        game.say('— Você viu? A indenização sumiu.')
        game.say('— Sumiu. E ninguém processa porque ninguém prova.')
        game.say('— Corvus sabe disso. Sempre soube.')
        return
      }

      if (id === 'passenger-book') {
        game.setFlag('bus_book_seen')
        game.triggerHandAction('reach', 650, target, id)
        game.say('“A LINGUAGEM DAS PEGADAS”. Título estranho pra ler tão cedo.')
        return
      }

      if (id === 'passenger-paulo') {
        game.setFlag('paulo_seen')
        game.say('Ele repete respostas de entrevista em silêncio. A perna não para.')
        return
      }

      if (id === 'stop-bell') {
        game.setFlag('stop_requested')
        game.triggerHandAction('press', 650, target, id)
        audioEngine.playDoorUnlock()
        game.say('Parada solicitada.')
        return
      }

      if (id === 'bus-exit' && game.flags.meridian_stop_ready) {
        game.setFlag('bus_exited')
        useShiftClock.getState().setWorldMinute(390)
        game.requestAreaTransition(
          'meridian-plaza',
          'plaza-arrival',
          { x: 0, y: 1.65, z: 5.8, yaw: Math.PI },
          1400,
        )
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE') return
      holding.current = false
      const bus = useBusTriageStore.getState()
      if (bus.triagePhase === 'alert') bus.setMarkProgress(0)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [scene])

  useFrame((_, delta) => {
    const game = useGameStore.getState()
    const bus = useBusTriageStore.getState()

    if (!gossipObject.current) {
      scene.traverse((object) => {
        if (!gossipObject.current && object.userData.busInteractableId === 'gossip-colleagues') {
          gossipObject.current = object
        }
      })
    }
    if (gossipObject.current) {
      const world = new THREE.Vector3()
      gossipObject.current.getWorldPosition(world)
      bus.setGossipDistance(camera.position.distanceTo(world))
    }

    if (
      game.note ||
      game.subtitle ||
      game.subtitleQueue.length > 0 ||
      game.cinematic ||
      game.areaTransition ||
      game.demoEnded ||
      bus.pinPhase === 'active'
    ) {
      currentId.current = null
      holding.current = false
      bus.setMarkProgress(0)
      game.setPrompt(null)
      return
    }

    raycaster.current.setFromCamera(CENTER, camera)
    raycaster.current.far = RANGE
    const hits = raycaster.current.intersectObjects(scene.children, true)
    let next: string | null = null

    for (const hit of hits) {
      if (hit.distance > RANGE) break
      const id = findBusInteractable(hit.object)
      if (!id) continue
      const prompt = promptFor(id, game.flags)
      if (!prompt) continue
      next = id
      interactionPoint.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }

    if (!next) game.setPrompt(null)
    currentId.current = next

    if (bus.triagePhase === 'alert') {
      bus.setFocusedCandidate(next && TRIAGE_CANDIDATES.has(next) ? next : null)
      if (holding.current && next && TRIAGE_CANDIDATES.has(next)) {
        const progress = bus.markProgress + Math.min(delta, 0.05) / HOLD_SECONDS
        bus.setMarkProgress(progress)
        if (progress >= 1) classifyCandidate(next)
      } else if (!holding.current && bus.markProgress > 0) {
        bus.setMarkProgress(0)
      }
    }
  })

  return null
}
