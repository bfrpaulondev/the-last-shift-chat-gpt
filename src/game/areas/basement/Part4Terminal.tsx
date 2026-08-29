import { Html } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

const QUERY_LINES = [
  'BadgeEvents',
  '| where TimeGenerated > ago(18h)',
  '| summarize entries = countif(Action == "ENTRY"),',
  '            exits   = countif(Action == "EXIT") by BadgeId, Owner',
  '| where entries != exits',
] as const

const RESULT_LINES = [
  '4471  │ PAULON, B.                               │    2    │   0',
  '4472  │ VALE, E. — TERMINATED 2024-11-08        │    1    │   0',
] as const

type Phase = 'query' | 'results' | 'contact' | 'replay' | 'replay-playing' | 'ending'

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function editDistanceOne(a: string, b: string) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1
      j += 1
      continue
    }
    edits += 1
    if (edits > 1) return false
    if (a.length > b.length) i += 1
    else if (b.length > a.length) j += 1
    else {
      i += 1
      j += 1
    }
  }
  return edits + Number(i < a.length || j < b.length) <= 1
}

function beep(frequency = 1200, duration = 0.04) {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return
  const context = new AudioContextCtor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.03, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
  oscillator.addEventListener('ended', () => void context.close(), { once: true })
}

export function Part4Terminal() {
  const [phase, setPhase] = useState<Phase>('query')
  const [input, setInput] = useState('')
  const [queryLine, setQueryLine] = useState(0)
  const [accepted, setAccepted] = useState<string[]>([])
  const [didYouMean, setDidYouMean] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [systemClock, setSystemClock] = useState('23:47')
  const [replayStep, setReplayStep] = useState(0)
  const timers = useRef<number[]>([])
  const bpm = useGameStore((state) => state.bpm)
  const canaryLive = useGameStore((state) => Boolean(state.flags.canary_live))
  const canaryKilled = useGameStore((state) => Boolean(state.flags.canary_killed))

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  const telemetry = (objectId: string, firstFlag?: string) => {
    const game = useGameStore.getState()
    game.logEvent({
      t: performance.now() / 1000,
      type: 'interact',
      objectId,
      wasFirstTime: firstFlag ? !game.flags[firstFlag] : true,
    })
    if (firstFlag) game.setFlag(firstFlag)
  }

  const finishPart = () => {
    const game = useGameStore.getState()
    game.setFlag('operator_skill_summarize')
    game.setFlag('operator_skill_join')
    game.setFlag('baseline_ueba')
    game.setFlag('canary_unlocked')
    game.setFlag('part4_complete')
    game.setCheckpoint('part4-complete', game.location.spawn)
    game.setObjective('PARTE 4 CONCLUÍDA — A CONTA ÓRFÃ.')
    telemetry('part4:complete')
    setPhase('ending')
  }

  useEffect(() => {
    const game = useGameStore.getState()
    game.setCinematic(true)
    game.setFlag('part4_terminal_return')
    game.setCheckpoint('part4-terminal-seat', game.location.spawn)
    game.setObjective('Construa a consulta que separa entradas de saídas.')
    telemetry('part4:terminal-open', 'part4_terminal_opened')
    return () => {
      clearTimers()
      const latest = useGameStore.getState()
      if (!latest.flags.part4_complete) latest.setCinematic(false)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'results') return
    clearTimers()
    setResultCount(0)
    setSystemClock('23:47')

    schedule(() => {
      setSystemClock('23:52')
      const game = useGameStore.getState()
      if (!game.flags.ntp_jump_witnessed) {
        game.setFlag('ntp_jump_witnessed')
        telemetry('part4:ntp-jump')
      }
    }, 520)
    schedule(() => setSystemClock('23:47'), 1550)
    schedule(() => {
      setResultCount(1)
      beep(1200)
    }, 880)
    schedule(() => {
      setResultCount(2)
      beep(660, 0.075)
    }, 1380)
    schedule(() => {
      const game = useGameStore.getState()
      game.setFlag('orphan_account_found')
      game.setCheckpoint('part4-orphan-account', game.location.spawn)
      game.say('Duas pessoas dentro deste prédio segundo os registros... eu e um cara demitido em novembro. Que entrou no dia em que desligaram ele... e cuja saída nunca foi registrada.')
      game.say('A conta dele nunca morreu. Ele é uma conta órfã... andando.')
      game.say('O relógio do prédio pisca quando essa tabela abre. Ou o tempo mente... ou alguém edita a hora pra esconder QUANDO as coisas aconteceram.')
      telemetry('part4:orphan-account-found')
    }, 2350)
    schedule(() => {
      const game = useGameStore.getState()
      game.setFlag('shadowbyte_contact_2')
      game.setFlag('he_hears')
      window.dispatchEvent(new Event('basement:shadowbyte'))
      setPhase('contact')
      if (game.flags.canary_live) {
        game.say('Gostei do cuidado com o meu switch. Ele gosta de você. Ele me mostra o que você pergunta. Você pergunta bem, colega. Quase bem.')
      } else {
        game.say('Você desligou meu switch. Isso foi honesto. Foi burro, mas foi honesto. Nós dois sabemos o que eu vou fazer a respeito... Nada. Você acabou de me contar que descobriu. Eu já sabia que você ia.')
      }
      game.say('E cuida do Judas. Ele é mais velho que a sua carreira aqui.')
      telemetry('part4:shadowbyte-contact-2')
    }, 5200)
    return clearTimers
  }, [phase])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (game.subtitle || game.subtitleQueue.length > 0) {
        if (event.code === 'Space' && game.subtitle) {
          event.preventDefault()
          game.dismissSubtitle()
        }
        return
      }

      if (phase === 'query') {
        const expected = QUERY_LINES[queryLine]
        if (didYouMean) {
          if (event.code !== 'KeyY' && event.code !== 'KeyN') return
          event.preventDefault()
          if (event.code === 'KeyY') {
            setAccepted((current) => [...current, expected])
            setInput('')
            setDidYouMean(false)
            telemetry('part4:typo-corrected')
            if (queryLine === QUERY_LINES.length - 1) setPhase('results')
            else setQueryLine((current) => current + 1)
          } else {
            setInput('')
            setDidYouMean(false)
          }
          return
        }

        if (event.code === 'Tab') {
          event.preventDefault()
          setInput(expected)
          telemetry('part4:ghost-autocomplete')
          return
        }
        if (event.code === 'Backspace') {
          event.preventDefault()
          setInput((current) => current.slice(0, -1))
          return
        }
        if (event.code === 'Enter') {
          event.preventDefault()
          if (normalize(input) === normalize(expected)) {
            setAccepted((current) => [...current, expected])
            setInput('')
            if (queryLine === QUERY_LINES.length - 1) setPhase('results')
            else setQueryLine((current) => current + 1)
          } else if (editDistanceOne(normalize(input), normalize(expected))) {
            setDidYouMean(true)
          } else {
            telemetry('part4:query-rejected')
          }
          return
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()
          const tremorChance = Math.max(0, bpm - 100) * 0.0007
          setInput((current) => current + event.key + (Math.random() < tremorChance ? event.key : ''))
        }
        return
      }

      if (phase === 'contact') {
        if (event.code !== 'Enter' && event.code !== 'Space') return
        event.preventDefault()
        setPhase('replay')
        return
      }

      if (phase === 'replay') {
        if (event.code === 'KeyY') {
          event.preventDefault()
          setPhase('replay-playing')
          setReplayStep(1)
          telemetry('part4:elevator-replay-started')
          schedule(() => setReplayStep(2), 1000)
          schedule(() => setReplayStep(3), 2400)
          schedule(() => {
            const latest = useGameStore.getState()
            latest.setFlag('elevator_ghost_ride')
            latest.say('O elevador desceu vazio. Ele conhece os pontos cegos da casa melhor que a planta.')
            telemetry('part4:elevator-ghost-ride')
            finishPart()
          }, 3900)
        } else if (event.code === 'KeyN') {
          event.preventDefault()
          finishPart()
        }
        return
      }

      if (phase === 'ending' && (event.code === 'Enter' || event.code === 'Space')) {
        event.preventDefault()
        game.setFlag('part4_ending_seen')
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [phase, input, queryLine, didYouMean, bpm])

  const canaryLine = canaryLive
    ? '[!] 3 events rewritten in last 5 min — signature: SW-12'
    : canaryKilled
      ? '[SW-12 OFFLINE] local event stream no longer rewritten'
      : ''

  const screen = useMemo(() => {
    if (phase === 'query') {
      return [
        'SENTINEL v9.4.1 — OPERATOR SKILL',
        '[NEW OPERATOR SKILL] summarize / countif / by',
        '',
        ...accepted,
        `${input || '▌'}${input ? '' : `   ${QUERY_LINES[queryLine]}`}`,
        ...(didYouMean ? [`DID YOU MEAN: ${QUERY_LINES[queryLine]} ? [Y/N]`] : []),
        '',
        'TAB: autocomplete · ENTER: execute line · BACKSPACE: correct',
        ...(canaryLine ? ['', canaryLine] : []),
      ]
    }
    if (phase === 'results' || phase === 'contact') {
      return [
        ...QUERY_LINES,
        '',
        'BADGE │ OWNER                                    │ ENTRIES │ EXITS',
        ...RESULT_LINES.slice(0, resultCount),
        ...(resultCount >= 2 ? [
          '',
          'NOTE: BADGE 4472 STATUS: RETIRED.',
          'EXIT EVENT: NEVER RECORDED.',
          'PERSON CURRENTLY ON PREMISES (PER RECORDS): 2.',
        ] : []),
        ...(canaryLine ? ['', canaryLine] : []),
        ...(phase === 'contact' ? ['', '[ENTER] ASSOCIATED FOOTAGE'] : []),
      ]
    }
    if (phase === 'replay') return ['ASSOCIATED FOOTAGE: ELEVATOR CAM — 00:15:34 — PLAY? [Y/N]']
    if (phase === 'replay-playing') return [
      'ELEVATOR CAM — 00:15:34',
      replayStep >= 1 ? 'CABIN: EMPTY' : '',
      replayStep >= 2 ? 'BUTTON: B1 — LIT' : '',
      replayStep >= 3 ? 'DIRECTION: DOWN' : '',
    ]
    return []
  }, [phase, accepted, input, queryLine, didYouMean, resultCount, canaryLine, replayStep])

  return (
    <Html fullscreen zIndexRange={[95, 85]}>
      <div className="part4-terminal-shell" role="dialog" aria-label="SENTINEL Part 4 terminal">
        {phase === 'ending' ? (
          <div className="part4-ending">
            <strong>PARTE 4 — FIM</strong>
            <p>“Quem entrou duas vezes, só saiu uma.”</p>
            <p>A resposta tinha número.</p>
            <code>BADGE 4472 — VALE, E. — TERMINATED 2024-11-08 — SAÍDA: NUNCA REGISTRADA.</code>
            <span>[UNLOCKED] SUMMARIZE/JOIN ● │ BASELINE/UEBA ● │ CANARY ●</span>
            <span>[MITRE] TACTIC 2/14: INITIAL ACCESS ● │ TACTIC 3/14: PERSISTENCE ●</span>
            <small>PRÓXIMO — PARTE 5: “A CONTA ÓRFÃ”</small>
          </div>
        ) : (
          <div className="part4-terminal">
            <header><span>SENTINEL v9.4.1</span><span>MERIDIAN TOWER · LOCAL CONSOLE</span></header>
            <pre>{screen.join('\n')}</pre>
            <footer><span>BPM {Math.round(bpm)}</span><span>SYSTEM CLOCK {systemClock}</span></footer>
          </div>
        )}
      </div>
    </Html>
  )
}
