import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 3
const HOLD_MS = 2000

function findInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.securityInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string, flags: Record<string, boolean>): string | null {
  if (id === 'cam02') return '[E] Consultar CAM 02 — LOBBY'
  if (id === 'fireman-override') {
    if (flags.all_doors_released) return null
    if (!flags.cam02_viewed || !flags.observed_first) return '[CAM 02 necessária] FIREMAN\'S OVERRIDE'
    return '[E] Segurar 2s — FIREMAN\'S OVERRIDE'
  }
  if (id === 'radio-base') return '[E] Testar rádio base'
  if (id === 'schedule') return '[E] Ver agenda de plantão'
  if (id === 'migration-checklist') return '[E] Ler checklist de migração'
  if (id === 'terminal-main') return '[E] Verificar terminal principal'
  if (id === 'corridor-check' && flags.observed_first) return '[E] Verificar corredor externo'
  return null
}

export function SecurityCenterInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const overrideTimer = useRef<number | null>(null)
  const overrideHolding = useRef(false)

  useEffect(() => {
    const cancelOverride = () => {
      if (overrideTimer.current !== null) {
        window.clearTimeout(overrideTimer.current)
        overrideTimer.current = null
      }
      if (!overrideHolding.current) return
      overrideHolding.current = false
      const game = useGameStore.getState()
      game.setCinematic(false)
      window.dispatchEvent(new Event('security:override-cancel'))
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'security:fireman-override-cancel',
        wasFirstTime: false,
      })
    }

    const completeOverride = () => {
      overrideTimer.current = null
      if (!overrideHolding.current) return
      overrideHolding.current = false
      const game = useGameStore.getState()
      if (game.location.area !== 'security-center') return
      game.setFlag('alarm_amp_cut')
      game.setFlag('all_doors_released')
      game.setCheckpoint('security-override-released', game.location.spawn)
      game.setObjective('Desça para o lobby e encontre Nascimento.')
      game.setCinematic(false)
      game.openNote("FIREMAN'S OVERRIDE", 'AUDIO AMP: DISCONNECTED — MANUAL CUT')
      window.dispatchEvent(new Event('security:override-complete'))
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'security:fireman-override-complete',
        wasFirstTime: true,
      })
    }

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
        event.repeat ||
        game.cinematic ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const seenFlag = `security_seen_${id}`
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `security:${id}`,
        wasFirstTime: !game.flags[seenFlag],
      })
      game.setFlag(seenFlag)

      if (id === 'cam02') {
        game.triggerHandAction('reach', 720, target, id)
        if (!game.flags.operator_gone) game.setFlag('operator_gone')
        if (!game.flags.cam02_checked) game.setFlag('cam02_checked')
        game.setCheckpoint('security-camera-seen', game.location.spawn)
        window.dispatchEvent(new Event('security:cam02-open'))
        return
      }

      if (id === 'fireman-override') {
        if (!game.flags.cam02_viewed || !game.flags.observed_first) return
        if (game.flags.all_doors_released || overrideTimer.current !== null) return

        overrideHolding.current = true
        game.setCinematic(true)
        game.triggerHandAction('turn', HOLD_MS, target, 'fireman-override')
        window.dispatchEvent(new Event('security:override-start'))
        overrideTimer.current = window.setTimeout(completeOverride, HOLD_MS)
        return
      }

      if (id === 'radio-base') {
        game.triggerHandAction('press', 620, target, id)
        game.setFlag('security_radio_checked')
        window.dispatchEvent(new Event('security:radio-static'))
        return
      }

      if (id === 'schedule') {
        game.triggerHandAction('reach', 620, target, id)
        game.setFlag('schedule_scratched')
        game.openNote('AGENDA DE PLANTÃO', 'ÚLTIMAS LINHAS\n\n[RASURADO À CANETA]\n[RASURADO À CANETA]')
        return
      }

      if (id === 'migration-checklist') {
        game.triggerHandAction('reach', 620, target, id)
        game.setFlag('migration_incomplete')
        game.openNote('MIGRAÇÃO — CHECKLIST TI-INTERNO', 'CONCLUÍDO: 40%\nPENDENTE: 60%')
        return
      }

      if (id === 'terminal-main') {
        game.triggerHandAction('press', 620, target, id)
        game.setFlag('terminal_blocked_pre_notebook')
        game.openNote('SENTINEL v9.4.1', 'LOGIN BLOQUEADO\nCREDENCIAL DE MANUTENÇÃO NECESSÁRIA')
        return
      }

      if (id === 'corridor-check' && game.flags.observed_first) {
        game.triggerHandAction('door', 850, target, id, 'door-handle')
        game.setFlag('observation_corridor_checked')
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && overrideHolding.current) cancelOverride()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (overrideTimer.current !== null) window.clearTimeout(overrideTimer.current)
      if (overrideHolding.current) {
        overrideHolding.current = false
        useGameStore.getState().setCinematic(false)
        window.dispatchEvent(new Event('security:override-cancel'))
      }
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
      const id = findInteractable(hit.object)
      if (!id) continue
      const prompt = promptFor(id, game.flags)
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
