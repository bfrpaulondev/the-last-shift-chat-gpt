import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { INTERACTABLES } from '../data/interactables'
import { useGameStore } from '../state/gameStore'

const INTERACTION_RANGE = 2.2
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

export function InteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentInteractableId = useRef<string | null>(null)
  const interactedIds = useRef(new Set<string>())

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useGameStore.getState()

      if (state.note) {
        if (event.code === 'KeyE' || event.code === 'Escape') {
          state.closeNote()
        }
        return
      }

      if (event.code !== 'KeyE') {
        return
      }

      const id = currentInteractableId.current
      if (!id) {
        return
      }

      const definition = INTERACTABLES[id]
      if (!definition) {
        return
      }

      const wasFirstTime = !interactedIds.current.has(id)
      interactedIds.current.add(id)

      if (definition.flag) {
        state.setFlag(definition.flag)
      }
      if (definition.subtitle) {
        state.say(definition.subtitle)
      }
      if (definition.note) {
        state.openNote(definition.note.title, definition.note.body)
      }
      if (definition.objective) {
        state.setObjective(definition.objective)
      }

      state.logEvent({
        t: (performance.now() - gameStartedAt) / 1000,
        type: 'interact',
        objectId: id,
        wasFirstTime,
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const state = useGameStore.getState()

    if (state.note) {
      currentInteractableId.current = null
      state.setPrompt(null)
      return
    }

    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera)
    raycaster.current.far = INTERACTION_RANGE

    const hits = raycaster.current.intersectObjects(scene.children, true)
    let nextId: string | null = null

    for (const hit of hits) {
      if (hit.distance > INTERACTION_RANGE) {
        break
      }

      const id = findInteractableId(hit.object)
      if (id && INTERACTABLES[id]) {
        nextId = id
        break
      }
    }

    currentInteractableId.current = nextId
    state.setPrompt(nextId ? INTERACTABLES[nextId].prompt : null)
  })

  return null
}
