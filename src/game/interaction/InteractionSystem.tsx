import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioEngine } from '../audio/AudioEngine'
import { INTERACTABLES } from '../data/interactables'
import { useGameStore } from '../state/gameStore'

const INTERACTION_RANGE = 2.2
const CENTER_SCREEN = new THREE.Vector2(0, 0)
const REQUIRED_EXIT_FLAGS = [
  'faucet_fixed',
  'coffee_made',
  'badge_taken',
  'phone_checked',
] as const
const gameStartedAt = performance.now()

function findInteractableId(object: THREE.Object3D | null): string | null {
  let current = object

  while (current) {
    const id = current.userData.interactableId
    if (typeof id === 'string') {
      return id
    }
    current = current.parent
  }

  return null
}

function exitReady(flags: Record<string, boolean>): boolean {
  return REQUIRED_EXIT_FLAGS.every((flag) => Boolean(flags[flag]))
}

function isAvailable(id: string, flags: Record<string, boolean>): boolean {
  if (id === 'bed' && flags.awake) {
    return false
  }
  if (id === 'badge' && flags.badge_taken) {
    return false
  }
  if (id === 'coffee' && flags.coffee_made) {
    return false
  }
  if (id === 'faucet_bathroom' && flags.faucet_fixed) {
    return false
  }
  return true
}

function getPrompt(id: string, flags: Record<string, boolean>): string | null {
  if (!isAvailable(id, flags)) {
    return null
  }

  if (id === 'door_exit') {
    return exitReady(flags) ? '[E] Sair' : '[E] Abrir a porta'
  }

  return INTERACTABLES[id]?.prompt ?? null
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function animateCameraPosition(
  camera: THREE.Camera,
  target: THREE.Vector3,
  durationMs: number,
  onComplete: () => void,
) {
  const start = performance.now()
  const origin = camera.position.clone()

  const tick = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1)
    camera.position.lerpVectors(origin, target, easeInOutCubic(progress))

    if (progress < 1) {
      window.requestAnimationFrame(tick)
    } else {
      onComplete()
    }
  }

  window.requestAnimationFrame(tick)
}

function animateCameraLookAt(
  camera: THREE.Camera,
  target: THREE.Vector3,
  durationMs: number,
  onComplete: () => void,
) {
  const start = performance.now()
  const origin = camera.quaternion.clone()
  const targetCamera = camera.clone()
  targetCamera.position.copy(camera.position)
  targetCamera.lookAt(target)
  const targetQuaternion = targetCamera.quaternion.clone()

  const tick = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1)
    camera.quaternion.slerpQuaternions(origin, targetQuaternion, easeInOutCubic(progress))

    if (progress < 1) {
      window.requestAnimationFrame(tick)
    } else {
      onComplete()
    }
  }

  window.requestAnimationFrame(tick)
}

export function InteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentInteractableId = useRef<string | null>(null)
  const interactedIds = useRef(new Set<string>())
  const busy = useRef(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useGameStore.getState()

      if (state.note) {
        if (event.code === 'KeyE' || event.code === 'Escape') {
          state.closeNote()
        }
        return
      }

      if (event.code !== 'KeyE' || busy.current || state.demoEnded) {
        return
      }

      const id = state.flags.awake ? currentInteractableId.current : 'bed'
      if (!id) {
        return
      }

      const definition = INTERACTABLES[id]
      if (!definition || !isAvailable(id, state.flags)) {
        return
      }

      const wasFirstTime = !interactedIds.current.has(id)
      interactedIds.current.add(id)
      state.logEvent({
        t: (performance.now() - gameStartedAt) / 1000,
        type: 'interact',
        objectId: id,
        wasFirstTime,
      })

      if (definition.mode === 'bed') {
        busy.current = true
        state.setCinematic(true)
        if (definition.subtitle) {
          state.say(definition.subtitle)
        }
        if (definition.objective) {
          state.setObjective(definition.objective)
        }

        animateCameraPosition(
          camera,
          new THREE.Vector3(-1.28, 1.65, 0.02),
          720,
          () => {
            if (definition.flag) {
              useGameStore.getState().setFlag(definition.flag)
            }
            useGameStore.getState().setCinematic(false)
            busy.current = false
          },
        )
        return
      }

      if (id === 'coffee') {
        busy.current = true
        audioEngine.playCoffee()
        state.setPrompt(null)
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          if (definition.flag) {
            latest.setFlag(definition.flag)
          }
          if (definition.subtitle) {
            latest.say(definition.subtitle)
          }
          busy.current = false
        }, 3000)
        return
      }

      if (definition.mode === 'shower') {
        if (!state.flags.awake) {
          return
        }

        busy.current = true
        state.setCinematic(true)
        state.setBlackout(true)
        audioEngine.playShower()
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          if (definition.flag) {
            latest.setFlag(definition.flag)
          }
          if (definition.subtitle) {
            latest.say(definition.subtitle)
          }
          latest.setBlackout(false)
          latest.setCinematic(false)
          busy.current = false
        }, 2000)
        return
      }

      if (definition.mode === 'window') {
        busy.current = true
        state.setCinematic(true)
        if (definition.flag) {
          state.setFlag(definition.flag)
        }
        if (definition.subtitle) {
          state.say(definition.subtitle, 6)
        }

        animateCameraLookAt(
          camera,
          new THREE.Vector3(3.5, 12, -27),
          2500,
          () => {
            useGameStore.getState().setCinematic(false)
            busy.current = false
          },
        )
        return
      }

      if (definition.mode === 'door') {
        if (!exitReady(state.flags)) {
          state.say('Primeiro: torneira, café, crachá, celular.')
          return
        }

        if (definition.flag) {
          state.setFlag(definition.flag)
        }
        audioEngine.setMuted(true)
        state.endDemo()
        if (document.pointerLockElement) {
          document.exitPointerLock()
        }
        return
      }

      if (definition.flag) {
        state.setFlag(definition.flag)
      }
      if (definition.subtitle) {
        state.say(definition.subtitle)
      }
      if (definition.note) {
        state.openNote(definition.note.title, definition.note.body)
      }
      if (definition.afterNoteSubtitle) {
        state.queueSubtitle(definition.afterNoteSubtitle)
      }
      if (definition.objective) {
        state.setObjective(definition.objective)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [camera])

  useFrame(() => {
    const state = useGameStore.getState()

    if (state.note || state.cinematic || state.demoEnded) {
      currentInteractableId.current = null
      state.setPrompt(null)
      return
    }

    if (!state.flags.awake) {
      currentInteractableId.current = 'bed'
      state.setPrompt(INTERACTABLES.bed.prompt)
      return
    }

    raycaster.current.setFromCamera(CENTER_SCREEN, camera)
    raycaster.current.far = INTERACTION_RANGE

    const hits = raycaster.current.intersectObjects(scene.children, true)
    let nextId: string | null = null

    for (const hit of hits) {
      if (hit.distance > INTERACTION_RANGE) {
        break
      }

      const id = findInteractableId(hit.object)
      if (id && INTERACTABLES[id] && isAvailable(id, state.flags)) {
        nextId = id
        break
      }
    }

    const prompt = nextId ? getPrompt(nextId, state.flags) : null
    currentInteractableId.current = prompt ? nextId : null
    state.setPrompt(prompt)
  })

  return null
}
