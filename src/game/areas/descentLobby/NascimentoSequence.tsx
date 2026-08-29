import { useEffect, useRef } from 'react'
import { useGameStore } from '../../state/gameStore'

export const NASCIMENTO_LINE_1 = 'Ele... já tava dentro, Bruno... desde antes... ninguém viu porque ninguém... anota...'
export const NASCIMENTO_LINE_2 = 'Eu anotei... trinta anos... eu anotei TUDO... computador é bom... mas só se alguém... escrever a verdade nele...'
export const NASCIMENTO_LINE_3 = 'Você não fez nada de errado, menino. Os registros vão provar... se você souber... ler.'
export const SHADOWBYTE_LINE = 'Sinto muito pelo seu amigo. Ele era de um tempo melhor. Faz o favor de devolver minha caderneta depois. Preciso dela. — ShadowByte'
export const BRUNO_NOTEBOOK_LINE = 'Tudo aqui dentro pode ser reescrito. Menos isso.'

export function startNascimentoConversation() {
  const game = useGameStore.getState()
  game.setFlag('nascimento_conversation_started')
  game.setCinematic(true)
  game.say(NASCIMENTO_LINE_1)
  game.say(NASCIMENTO_LINE_2)
  game.say(NASCIMENTO_LINE_3)
}

export function NascimentoSequence() {
  const flags = useGameStore((state) => state.flags)
  const subtitle = useGameStore((state) => state.subtitle)
  const subtitleQueue = useGameStore((state) => state.subtitleQueue)
  const deathTimer = useRef<number | null>(null)
  const elevatorTimer = useRef<number | null>(null)

  useEffect(() => {
    const game = useGameStore.getState()
    if (!game.flags.nascimento_conversation_started) return

    if (subtitle === NASCIMENTO_LINE_1 && !game.flags.nascimento_notebook_push) {
      game.setFlag('nascimento_notebook_push')
      return
    }

    if (subtitle === NASCIMENTO_LINE_2 && !game.flags.nascimento_wrist_grab) {
      game.setFlag('nascimento_wrist_grab')
      game.triggerHandAction('brace', 1300, undefined, 'nascimento-wrist')
      return
    }

    if (subtitle === NASCIMENTO_LINE_3 && !game.flags.nascimento_camera_gaze) {
      game.setFlag('nascimento_camera_gaze')
    }
  }, [subtitle])

  useEffect(() => {
    if (
      !flags.nascimento_conversation_started ||
      !flags.nascimento_camera_gaze ||
      flags.nascimento_dead ||
      subtitle !== null ||
      subtitleQueue.length > 0 ||
      deathTimer.current !== null
    ) return

    const game = useGameStore.getState()
    game.setFlag('nascimento_dead')
    game.setCheckpoint('night-lobby-loss', game.location.spawn)
    game.setObjective('Fique com ele.')
    game.setCinematic(true)
    window.dispatchEvent(new CustomEvent('part3:total-silence', { detail: { durationMs: 4000 } }))
    window.dispatchEvent(new CustomEvent('lobby:death-silence', { detail: { durationMs: 4000 } }))

    deathTimer.current = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area === 'descent-lobby') {
        latest.setCinematic(false)
        latest.setObjective('Pegue a caderneta de Nascimento.')
      }
      deathTimer.current = null
    }, 4000)
  }, [flags.nascimento_camera_gaze, flags.nascimento_conversation_started, flags.nascimento_dead, subtitle, subtitleQueue.length])

  useEffect(() => {
    const game = useGameStore.getState()
    if (game.flags.elevator_arrival_started && !game.flags.elevator_alone) {
      game.setFlag('elevator_alone')
      game.setObjective('Entre no elevador de serviço.')
    }
  }, [])

  useEffect(() => {
    if (
      !flags.notebook_taken ||
      !flags.shadowbyte_contact_1 ||
      !flags.shadowbyte_dialogue_started ||
      flags.elevator_arrival_started ||
      flags.elevator_alone ||
      subtitle !== null ||
      subtitleQueue.length > 0 ||
      elevatorTimer.current !== null
    ) return

    const game = useGameStore.getState()
    game.setFlag('elevator_arrival_started')
    game.setObjective('Ouça o elevador de serviço.')
    window.dispatchEvent(new Event('lobby:elevator-cables'))
    elevatorTimer.current = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area === 'descent-lobby') {
        latest.setFlag('elevator_alone')
        latest.setCheckpoint('night-lobby-elevator-ready', latest.location.spawn)
        latest.setObjective('Entre no elevador de serviço.')
        window.dispatchEvent(new Event('lobby:elevator-open'))
      }
      elevatorTimer.current = null
    }, 2000)
  }, [
    flags.elevator_alone,
    flags.elevator_arrival_started,
    flags.notebook_taken,
    flags.shadowbyte_contact_1,
    flags.shadowbyte_dialogue_started,
    subtitle,
    subtitleQueue.length,
  ])

  useEffect(() => () => {
    if (deathTimer.current !== null) window.clearTimeout(deathTimer.current)
    if (elevatorTimer.current !== null) window.clearTimeout(elevatorTimer.current)
  }, [])

  return null
}
