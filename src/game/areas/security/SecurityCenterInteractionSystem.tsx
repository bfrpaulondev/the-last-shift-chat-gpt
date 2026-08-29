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

function promptFor(id: string): string | null {
  if (id === 'cam-02') return '[E] Consultar CAM 02 — LOBBY'
  if (id === 'fire-override') return '[E] Segurar — FIREMAN\'S OVERRIDE'
  if (id === 'radio-base') return '[E] Chamar no rádio base'
  if (id === 'duty-schedule') return '[E] Ver agenda de plantão'
  if (id === 'migration-checklist') return '[E] Ler checklist de migração'
  if (id === 'terminal-locked') return '[E] Verificar terminal principal'
  return null
}

export function SecurityCenterInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const holdTimer = useRef<number | null>(null)
  const cameraZoomTimer = useRef<number | null>(null)

  useEffect(() => {
    const triggerObservation = () => {
      const game = useGameStore.getState()
      if (game.flags.observed_first) return
      game.setFlag('observed_first')
      game.adjustBpm(25)
      game.setCheckpoint('security-observed-first', game.location.spawn)
      window.dispatchEvent(new Event('security:observation'))
      game.say('...')
    }

    const closeCamera = () => {
      const game = useGameStore.getState()
      game.closeNote()
      window.setTimeout(triggerObservation, 500)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (game.note?.title === 'CAM 02 — LOBBY — 23:52:07') {
        if (event.code === 'Escape') {
          event.preventDefault()
          closeCamera()
          return
        }
        if (event.code === 'KeyE' && !event.repeat && cameraZoomTimer.current === null) {
          event.preventDefault()
          cameraZoomTimer.current = window.setTimeout(() => {
            const latest = useGameStore.getState()
            if (!latest.note || latest.note.title !== 'CAM 02 — LOBBY — 23:52:07') return
            latest.setFlag('cam02_zoomed')
            latest.adjustBpm(8)
            latest.say('Não está respirando.')
          }, 700)
        }
        return
      }

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
      if (event.defaultPrevented || event.code !== 'KeyE' || game.cinematic || game.areaTransition || game.demoEnded) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const seenFlag = `security_seen_${id}`
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `security:${id}`, wasFirstTime: !game.flags[seenFlag] })
      game.setFlag(seenFlag)

      if (id === 'cam-02') {
        game.triggerHandAction('reach', 720, target, id)
        if (!game.flags.operator_gone) game.setFlag('operator_gone')
        if (!game.flags.clock_mismatch) game.setFlag('clock_mismatch')
        game.setFlag('cam02_checked')
        game.setCheckpoint('security-camera-seen', game.location.spawn)
        game.openNote(
          'CAM 02 — LOBBY — 23:52:07',
          'LOBBY / VISTA SUPERIOR\n\nNascimento está caído atrás do balcão. O rádio está ao lado da mão. A caderneta está aberta.\n\nRELÓGIO DO FEED: 23:52:07\nRELÓGIO DO PULSO: 23:47\n\n[SEGURE E] zoom digital · [ESC] fechar feed',
        )
        game.queueSubtitle('Cinco minutos. Quem tá mentindo?')
        return
      }

      if (id === 'fire-override') {
        if (!game.flags.observed_first) {
          game.say('Primeiro preciso entender o que aconteceu no lobby.')
          return
        }
        if (game.flags.all_doors_released || holdTimer.current !== null) {
          if (game.flags.all_doors_released) game.say('As portas já estão liberadas.')
          return
        }
        game.triggerHandAction('turn', HOLD_MS, target, id)
        window.dispatchEvent(new Event('security:override-alarm'))
        holdTimer.current = window.setTimeout(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'security-center') return
          latest.setFlag('alarm_amp_cut')
          latest.setFlag('all_doors_released')
          latest.setCheckpoint('security-override-released', latest.location.spawn)
          latest.setObjective('Desça para o lobby e encontre Nascimento.')
          latest.say('Cortaram o amplificador manualmente.')
          holdTimer.current = null
        }, HOLD_MS)
        return
      }

      if (id === 'radio-base') {
        game.triggerHandAction('press', 620, target, id)
        game.setFlag('security_radio_checked')
        game.say('Central para qualquer unidade... alguém responde?')
        game.queueSubtitle('Só chiado.')
        return
      }

      if (id === 'duty-schedule') {
        game.triggerHandAction('reach', 620, target, id)
        game.setFlag('schedule_scratched')
        game.openNote('AGENDA DE PLANTÃO', '39.º / CENTRAL\n\n22:00 — DIEGO\n23:00 — DIEGO\n00:00 — [RASURADO À CANETA]\n01:00 — [RASURADO À CANETA]')
        return
      }

      if (id === 'migration-checklist') {
        game.triggerHandAction('reach', 620, target, id)
        game.setFlag('migration_incomplete')
        game.openNote('MIGRAÇÃO — CHECKLIST TI-INTERNO', 'STATUS GERAL: 40% CONCLUÍDO\n\n✓ inventário físico\n✓ rede isolada\n○ câmeras — PENDENTE\n○ logs — PENDENTE\n○ relógio/NTP — PENDENTE\n○ failover — PENDENTE')
        return
      }

      if (id === 'terminal-locked') {
        game.triggerHandAction('press', 620, target, id)
        game.say('Pede credencial de operador. Eu não tenho a senha.')
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && cameraZoomTimer.current !== null) {
        window.clearTimeout(cameraZoomTimer.current)
        cameraZoomTimer.current = null
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
      if (cameraZoomTimer.current !== null) window.clearTimeout(cameraZoomTimer.current)
    }
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
      const id = findInteractable(hit.object)
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
