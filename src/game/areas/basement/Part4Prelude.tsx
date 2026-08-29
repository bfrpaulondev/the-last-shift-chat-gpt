import { Html } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

const M1_LINES = [
  'ElevatorEvents',
  '| where TimeGenerated > ago(12h) and Floor == "B1"',
  '| project TimeGenerated, Direction, BadgeId',
] as const

const M2_LINES = [
  'BadgeEvents',
  '| where TimeGenerated > ago(2h)',
  '| project TimeGenerated, Location, BadgeId',
] as const

const BASEMENT_SPAWN = { x: 0, y: 1.65, z: 13.4, yaw: Math.PI }

type PreludePhase = 'idle' | 'm1' | 'm1-results' | 'm2' | 'm2-results'

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

function beep(frequency = 1050) {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return
  const context = new AudioContextCtor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.025, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.04)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.045)
  oscillator.addEventListener('ended', () => void context.close(), { once: true })
}

export function Part4Prelude() {
  const [phase, setPhase] = useState<PreludePhase>('idle')
  const [lineIndex, setLineIndex] = useState(0)
  const [accepted, setAccepted] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [didYouMean, setDidYouMean] = useState(false)
  const flags = useGameStore((state) => state.flags)
  const location = useGameStore((state) => state.location)
  const bpm = useGameStore((state) => state.bpm)
  const active = location.area === 'security-center' && Boolean(flags.part3_complete) && !flags.part4_started

  const beginDescent = () => {
    const game = useGameStore.getState()
    if (!game.flags.part4_started) {
      game.setPhoneBattery(3)
      game.setFlag('part4_started')
    }
    game.setCheckpoint('part4-leaving-39', game.location.spawn)
    game.setObjective('Desça ao B1 pelo elevador de serviço.')
    game.requestAreaTransition('basement', 'basement-descent', BASEMENT_SPAWN, 1500)
  }

  const startQuery = (next: 'm1' | 'm2') => {
    setPhase(next)
    setLineIndex(0)
    setAccepted([])
    setInput('')
    setDidYouMean(false)
    const game = useGameStore.getState()
    game.setObjective(next === 'm1' ? 'Consulte os eventos do elevador no B1.' : 'Compare o mesmo crachá nos últimos 2h.')
  }

  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (game.subtitle || game.subtitleQueue.length > 0) {
        if (event.code === 'Space' && game.subtitle) {
          event.preventDefault()
          game.dismissSubtitle()
        }
        return
      }

      if (phase === 'idle') {
        if (event.code !== 'Enter' && event.code !== 'Space') return
        event.preventDefault()

        if (game.flags.choice_basement_now || game.flags.clone_confirmed) {
          beginDescent()
          return
        }

        if (game.flags.choice_logs_first) {
          startQuery('m1')
          return
        }

        startQuery('m1')
        return
      }

      if (phase === 'm1' || phase === 'm2') {
        const lines = phase === 'm1' ? M1_LINES : M2_LINES
        const expected = lines[lineIndex]

        if (didYouMean) {
          if (event.code !== 'KeyY' && event.code !== 'KeyN') return
          event.preventDefault()
          if (event.code === 'KeyY') {
            setAccepted((current) => [...current, expected])
            setInput('')
            setDidYouMean(false)
            if (lineIndex === lines.length - 1) setPhase(phase === 'm1' ? 'm1-results' : 'm2-results')
            else setLineIndex((current) => current + 1)
          } else {
            setInput('')
            setDidYouMean(false)
          }
          return
        }

        if (event.code === 'Tab') {
          event.preventDefault()
          setInput(expected)
          beep()
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
            beep()
            if (lineIndex === lines.length - 1) setPhase(phase === 'm1' ? 'm1-results' : 'm2-results')
            else setLineIndex((current) => current + 1)
          } else if (editDistanceOne(normalize(input), normalize(expected))) {
            setDidYouMean(true)
          }
          return
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()
          setInput((current) => current + event.key)
        }
        return
      }

      if (phase === 'm1-results' && (event.code === 'Enter' || event.code === 'Space')) {
        event.preventDefault()
        if (!game.flags.stairs_route_deduced) {
          game.setFlag('stairs_route_deduced')
          game.setCheckpoint('part4-m1-complete', game.location.spawn)
          game.say('Desceu às 00:15. E nunca subiu. As escadas não têm leitor no subsolo... ele sobe pelo concreto.')
          game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: 'part4:m1-elevator-events', wasFirstTime: true })
          return
        }
        startQuery('m2')
        return
      }

      if (phase === 'm2-results' && (event.code === 'Enter' || event.code === 'Space')) {
        event.preventDefault()
        if (!game.flags.clone_confirmed) {
          game.setFlag('clone_confirmed')
          game.setFlag('mitre_initial_access')
          game.setCheckpoint('part4-m2-complete', game.location.spawn)
          game.say('O mesmo crachá, no mesmo minuto, em dois lugares. Crachá não se duplica... copiam.')
          game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: 'part4:m2-clone-confirmed', wasFirstTime: true })
          return
        }
        beginDescent()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [active, phase, lineIndex, input, didYouMean])

  const screen = useMemo(() => {
    if (phase === 'm1') {
      return ['PART 4 — PREPARATORY QUERY 1', '', ...accepted, `${input || '▌'}${input ? '' : `   ${M1_LINES[lineIndex]}`}`, ...(didYouMean ? [`DID YOU MEAN: ${M1_LINES[lineIndex]} ? [Y/N]`] : []), '', 'TAB: ghost · ENTER: execute']
    }
    if (phase === 'm1-results') {
      return [...M1_LINES, '', '00:15:34 │ DOWN │ 4471', '(no DOWN event after 00:15:34. No UP event. Ever.)', '', flags.stairs_route_deduced ? '[ENTER] NEXT QUERY' : '[ENTER] READ RESULT']
    }
    if (phase === 'm2') {
      return ['PART 4 — PREPARATORY QUERY 2', '', ...accepted, `${input || '▌'}${input ? '' : `   ${M2_LINES[lineIndex]}`}`, ...(didYouMean ? [`DID YOU MEAN: ${M2_LINES[lineIndex]} ? [Y/N]`] : []), '', 'TAB: ghost · ENTER: execute']
    }
    if (phase === 'm2-results') {
      return [...M2_LINES, '', '00:20:11 │ DOOR 38-SEC │ 4471', '00:20:11 │ BASEMENT SERVICE ROUTE │ 4471', '', '[UNLOCK MITRE — TACTIC 2/14: INITIAL ACCESS]', '', flags.clone_confirmed ? '[ENTER] DESCEND TO B1' : '[ENTER] READ RESULT']
    }
    return []
  }, [phase, accepted, input, lineIndex, didYouMean, flags.stairs_route_deduced, flags.clone_confirmed])

  if (!active) return null

  return (
    <Html fullscreen zIndexRange={[98, 92]}>
      {phase === 'idle' ? (
        <div className="part4-prelude-continue">
          <span>[ENTER] CONTINUAR — PARTE 4: O PORÃO</span>
        </div>
      ) : (
        <div className="part4-prelude-shell" role="dialog" aria-label="Consultas preparatórias da Parte 4">
          <div className="part4-prelude-terminal">
            <header><span>SENTINEL v9.4.1</span><span>MERIDIAN TOWER · 39.º</span></header>
            <pre>{screen.join('\n')}</pre>
            <footer><span>BPM {Math.round(bpm)}</span><span>SYSTEM CLOCK 23:47</span></footer>
          </div>
        </div>
      )}
    </Html>
  )
}
