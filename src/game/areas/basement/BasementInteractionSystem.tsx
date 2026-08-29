import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 3.2
const TERMINAL_SPAWN = { x: 0, y: 1.65, z: 5.2, yaw: Math.PI }

function findInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.basementInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string, flags: Record<string, boolean>, crouching: boolean): string | null {
  if (id === 'cam04-monitor') return flags.cam04_frozen ? '[REGISTRO] CAM 04 — FRAME 23:50:07' : '[E] Reconectar monitor CFTV — CAM 04'
  if (id === 'ceo-car') return flags.charger_found ? '[REGISTRO] VAGA 07 — BRANDÃO, O.' : '[E] Verificar mala no banco traseiro'
  if (id === 'blue-cable') {
    if (flags.hardware_hidden_in_migration) return '[REGISTRO] CABO AZUL — PORTA 37'
    if (!flags.cam04_frozen) return null
    return crouching ? '[E] Apalpar rodapé e seguir o cabo azul' : '[C] Agachar para seguir o cabo azul'
  }
  if (id === 'migration-box') return flags.hardware_hidden_in_migration && !flags.ghost_switch_found ? '[E] Levantar aba da caixa de migração' : null
  if (id === 'diego-phone') return flags.diego_found ? (flags.closed_eyes_2 ? '[REGISTRO] DIEGO — 0527' : '[E] Fechar os olhos de Diego') : '[E] Pegar o celular da mão de Diego'
  if (id === 'ghost-switch') {
    if (!flags.ghost_switch_found) return null
    if (flags.canary_live || flags.canary_killed) return '[REGISTRO] SW-12 — DECISÃO TOMADA'
    if (!flags.diego_found) return '[DIEGO primeiro] SW-12 — UNREGISTERED DEVICE'
    return '[E] Analisar SW-12 — dispositivo não inventariado'
  }
  if (id === 'vale-dossier') return flags.vale_dossier ? '[REGISTRO] LOTE 12 — VALE, E.' : '[E] Puxar folha atrás da estante'
  if (id === 'approvals-missing') return flags.approvals_folder_gone ? '[REGISTRO] BRANDÃO, O. — PASTA AUSENTE' : '[E] Examinar espaço vazio'
  if (id === 'judas') return '[E] Acariciar Judas'
  if (id === 'outlet') return '[E] Conectar celular — +1% a cada 5 min parado no escuro'
  if (id === 'return-elevator') {
    if (!flags.canary_live && !flags.canary_killed) return '[SW-12 pendente] Voltar ao 39.º'
    return '[E] Voltar ao terminal do 39.º'
  }
  return null
}

export function BasementInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const cableStage = useRef(0)
  const crouching = useRef(false)
  const falsePositiveArmed = useRef(false)
  const catLookTimer = useRef<number | null>(null)
  const [canaryChoosing, setCanaryChoosing] = useState(false)

  const telemetry = (objectId: string, firstFlag?: string) => {
    const game = useGameStore.getState()
    game.logEvent({
      t: performance.now() / 1000,
      type: 'interact',
      objectId,
      wasFirstTime: firstFlag ? !game.flags[firstFlag] : true,
    })
  }

  const chooseCanary = (leaveOnline: boolean) => {
    const game = useGameStore.getState()
    if (game.flags.canary_live || game.flags.canary_killed) return
    const flag = leaveOnline ? 'canary_live' : 'canary_killed'
    game.setFlag(flag)
    game.setCheckpoint(flag, game.location.spawn)
    game.setCinematic(false)
    game.setObjective('Volte ao 39.º e consulte os registros com o que encontrou.')
    telemetry(leaveOnline ? 'basement:canary-live' : 'basement:canary-killed')
    setCanaryChoosing(false)
    window.dispatchEvent(new Event('basement:shadowbyte'))
    if (leaveOnline) {
      game.triggerHandAction('reach', 1050, undefined, 'basement-switch')
      game.say('Gostei do cuidado com o meu switch. Ele gosta de você.')
    } else {
      game.triggerHandAction('grab', 1600, undefined, 'basement-switch')
      window.dispatchEvent(new Event('basement:connector-yank'))
      game.say('Você desligou meu switch. Isso foi honesto. Foi burro, mas foi honesto.')
    }
  }

  useEffect(() => {
    const onCrouch = (event: Event) => {
      const detail = (event as CustomEvent<{ crouching?: boolean }>).detail
      crouching.current = Boolean(detail?.crouching)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (canaryChoosing) {
        if (event.code === 'Digit1' || event.code === 'Digit2') {
          event.preventDefault()
          chooseCanary(event.code === 'Digit1')
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
      telemetry(`basement:${id}`, `basement_seen_${id}`)
      game.setFlag(`basement_seen_${id}`)

      if (id === 'cam04-monitor') {
        game.triggerHandAction('press', 1150, target, 'coffee', 'coffee-press')
        if (!game.flags.cam04_frozen) {
          game.setFlag('cam04_frozen')
          game.setCheckpoint('basement-cam04-frozen', game.location.spawn)
          game.openNote('CAM 04 — VISÃO DE REGISTRO', 'CAM 04 │ FRAME FROZEN SINCE 23:50:07\nSTORAGE LOOP FULL │ WRITE FAIL\n\nO feed é um fotograma do passado. O LED da câmera permanece vermelho fixo.')
          game.queueSubtitle('Não é câmera com defeito. É câmera SEM AR. O disco encheu... de quê?')
        }
        return
      }

      if (id === 'ceo-car') {
        game.triggerHandAction('reach', 900, target, 'ceo-car')
        if (!game.flags.charger_found) {
          game.setFlag('ceo_bag_in_car')
          game.setFlag('charger_found')
          game.adjustPhoneBattery(1)
          game.openNote('VAGA 07 — BRANDÃO, O.', 'Sedan cinza. Mala de emergência no banco traseiro.\n\nPOWERBANK + CARREGADOR ENCONTRADOS\nBATERIA: +1%')
          game.queueSubtitle('Mala pronta num sábado de reunião. Ninguém faz mala pronta pra uma reunião.')
        }
        return
      }

      if (id === 'blue-cable') {
        if (!game.flags.cam04_frozen || game.flags.hardware_hidden_in_migration) return
        if (!crouching.current) {
          game.say('Preciso baixar. O cabo some no rodapé.')
          return
        }
        cableStage.current += 1
        game.triggerHandAction('reach', 1350, target, 'basement-cable')
        if (cableStage.current === 1) {
          game.say('Porta 37. Cabo novo. Poeira velha.')
          game.setCheckpoint('basement-cable-1', game.location.spawn)
        } else if (cableStage.current === 2) {
          game.say('Furo novo na parede. Gesso fresco.')
          game.setCheckpoint('basement-cable-2', game.location.spawn)
        } else {
          game.setFlag('hardware_hidden_in_migration')
          game.setCheckpoint('basement-migration-box-found', game.location.spawn)
          game.say('Ele não trouxe hardware nenhum. Ele escondeu o dele DENTRO da mudança. Ninguém inventoria caixa de migração numa noite assim.')
        }
        return
      }

      if (id === 'migration-box') {
        if (!game.flags.hardware_hidden_in_migration || game.flags.ghost_switch_found) return
        game.triggerHandAction('door', 1200, target, 'door_exit', 'door-handle')
        window.dispatchEvent(new Event('basement:cardboard'))
        game.setFlag('ghost_switch_found')
        game.setFlag('mitre_persistence')
        game.setCheckpoint('basement-ghost-switch-found', game.location.spawn)
        game.openNote('SW-12 — NÃO INVENTARIADO', 'Dispositivo industrial, limpo, anônimo.\nMesma etiqueta manuscrita “12”.\nLED azul: 3 curtos · 1 longo.\n\n[UNLOCK MITRE — TACTIC 3/14: PERSISTENCE]')
        game.queueSubtitle('Persistência. Ele comprou um endereço no prédio. Um lugar onde ele mora nos registros.')
        return
      }

      if (id === 'diego-phone') {
        if (!game.flags.diego_found) {
          game.triggerHandAction('grab', 1650, target, 'phone', 'phone-lift')
          game.setFlag('diego_found')
          game.setFlag('last_message_rog')
          game.setCheckpoint('basement-diego-found', game.location.spawn)
          window.dispatchEvent(new Event('basement:diego-silence'))
          window.dispatchEvent(new Event('basement:cracked-phone'))
          game.openNote('CELULAR DE DIEGO — 23:04 — NÃO ENVIADA', '“ROG, o equipamento 12 da lista não é o que pediram. Não é nosso. Não liga ele—”')
          game.queueSubtitle('Ele VIU. Ele viu o switch e foi avisar... o Rogério.')
          game.queueSubtitle('Todo mundo que anota as coisas direito acaba parando no meio de uma frase.')
        } else if (!game.flags.closed_eyes_2) {
          telemetry('basement:closed-eyes-2', 'closed_eyes_2')
          game.triggerHandAction('reach', 1350, target, 'diego-eyes')
          game.setFlag('closed_eyes_2')
        }
        return
      }

      if (id === 'ghost-switch') {
        if (!game.flags.ghost_switch_found || !game.flags.diego_found || game.flags.canary_live || game.flags.canary_killed) return
        game.setCinematic(true)
        game.setPrompt(null)
        setCanaryChoosing(true)
        return
      }

      if (id === 'vale-dossier') {
        game.triggerHandAction('grab', 1150, target, 'badge', 'badge-pickup')
        if (!game.flags.vale_dossier) {
          game.setFlag('vale_dossier')
          game.openNote('CORVUS FACILITY GROUP — REESTRUTURAÇÃO 08/11/2024 — LOTE 12', '14 nomes. 13: INDENIZAÇÃO PAGA.\n\nVALE, E. — Assistente Técnico N3 — 6 anos de casa\n\nNÃO PAGO — ERRO OPERACIONAL')
          game.queueSubtitle('Erro operacional. Caiu na conta e sumiu. A mulher do ônibus tinha razão... ninguém processa porque ninguém prova.')
        }
        return
      }

      if (id === 'approvals-missing') {
        game.triggerHandAction('reach', 720, target, 'approvals-missing')
        if (!game.flags.approvals_folder_gone) {
          game.setFlag('approvals_folder_gone')
          game.say('A pasta das aprovações do Brandão não está aqui. Quem leva pasta de aprovação num incêndio?')
        }
        return
      }

      if (id === 'judas') {
        game.triggerHandAction('reach', 1350, target, 'basement-cat')
        game.setFlag('cat_friend')
        game.adjustBpm(-10)
        window.dispatchEvent(new Event('basement:cat-purr'))
        return
      }

      if (id === 'outlet') {
        game.triggerHandAction('press', 850, target, 'coffee', 'coffee-press')
        game.setFlashlightOn(false)
        window.dispatchEvent(new Event('basement:charging-start'))
        game.say('Tomada viva. Tela morta. Se eu ficar parado... cinco minutos por um por cento.')
        return
      }

      if (id === 'return-elevator') {
        if (!game.flags.canary_live && !game.flags.canary_killed) return
        game.triggerHandAction('press', 720, target, 'return-elevator')
        game.setFlag('basement_investigation_complete')
        game.setCheckpoint('basement-returning-39', game.location.spawn)
        game.requestAreaTransition('part4-terminal', 'part4-terminal-return', TERMINAL_SPAWN, 1300)
      }
    }

    window.addEventListener('game:crouch', onCrouch)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('game:crouch', onCrouch)
      window.removeEventListener('keydown', onKeyDown, true)
      if (catLookTimer.current !== null) window.clearTimeout(catLookTimer.current)
    }
  }, [canaryChoosing])

  useFrame(() => {
    const game = useGameStore.getState()

    if (
      !game.flags.false_positive_cat &&
      game.flags.cam04_frozen &&
      camera.position.z < 6.2 &&
      !falsePositiveArmed.current
    ) {
      falsePositiveArmed.current = true
      game.setFlag('false_positive_cat')
      game.setFlag('cat_friend')
      game.adjustBpm(20)
      window.dispatchEvent(new Event('basement:can-roll'))
      game.say('MOTION DETECTED — SECTOR B1-3')
      game.say('Um gato. O movimento do subsolo é um gato chamado... deixa eu ver... Judas. O Nascimento anotava até isso. Anotava TUDO.')
    }

    if (
      game.flags.ghost_switch_found &&
      !game.flags.cat_looks_up &&
      camera.position.z < -9 &&
      catLookTimer.current === null
    ) {
      catLookTimer.current = window.setTimeout(() => {
        const latest = useGameStore.getState()
        if (latest.location.area !== 'basement' || latest.flags.cat_looks_up) return
        latest.setFlag('cat_looks_up')
        latest.logEvent({
          t: performance.now() / 1000,
          type: 'interact',
          objectId: 'basement:cat-looks-up',
          wasFirstTime: true,
        })
        catLookTimer.current = null
      }, 2000)
    }

    if (
      game.note ||
      game.subtitle ||
      game.subtitleQueue.length > 0 ||
      game.cinematic ||
      game.areaTransition ||
      game.demoEnded ||
      canaryChoosing
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
      const prompt = promptFor(id, game.flags, crouching.current)
      if (!prompt) continue
      next = id
      point.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }
    if (!next) game.setPrompt(null)
    currentId.current = next
  })

  return (
    <>
      {canaryChoosing && (
        <Html fullscreen zIndexRange={[90, 80]}>
          <div className="canary-shell" role="dialog" aria-label="Decisão do canário SW-12">
            <div className="canary-terminal">
              <strong>SW-12 │ UNREGISTERED DEVICE │ ACTIVE</strong>
              <span>├ [1] LEAVE ONLINE — MONITOR ITS EDITS</span>
              <span>└ [2] DISCONNECT</span>
              <small>Nenhuma opção é marcada como correta.</small>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}
