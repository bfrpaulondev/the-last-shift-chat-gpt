import { Html } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../../state/gameStore'

const LOGIN_COMMAND = 'SENTINEL --maintenance --operator=4471'
const QUERY_LINES = [
  'BadgeEvents',
  '| where BadgeId == "4471"',
  '| order by TimeGenerated asc',
  '| project TimeGenerated, Location, Action, Result',
] as const
const RESULT_LINES = [
  '23:12:08 │ LOBBY │ ENTRY │ OK',
  '23:58:12 │ DOOR 37-BREAKROOM │ OPEN │ OK',
  '23:59:41 │ DOOR 37-MAIN │ LOCKED │ OK',
  '00:15:33 │ LOBBY │ ENTRY │ OK',
  '00:15:34 │ ELEVATOR │ BASEMENT │ OK',
  'ENTITY (todas as linhas): BADGE 4471 — PAULON, B.',
  'ENTRIES: 2 │ EXITS: 0',
] as const

type TerminalPhase = 'closed' | 'boot' | 'notebook' | 'login' | 'incident' | 'training' | 'query' | 'results' | 'replay' | 'vision' | 'pact' | 'choice' | 'ending'

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
  return edits + Number(i < a.length || j < b.length) === 1
}

function beep(frequency = 620, duration = 0.04) {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'square'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.032, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
  oscillator.addEventListener('ended', () => void context.close(), { once: true })
}

export function SentinelTerminal() {
  const [phase, setPhase] = useState<TerminalPhase>('closed')
  const [bootLines, setBootLines] = useState<string[]>([])
  const [notebookPage, setNotebookPage] = useState(0)
  const [input, setInput] = useState('')
  const [queryLine, setQueryLine] = useState(0)
  const [queryAccepted, setQueryAccepted] = useState<string[]>([])
  const [resultCount, setResultCount] = useState(0)
  const [didYouMean, setDidYouMean] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [replayTime, setReplayTime] = useState(0)
  const sequence = useRef(0)
  const timers = useRef<number[]>([])
  const bpm = useGameStore((state) => state.bpm)
  const part3Complete = useGameStore((state) => Boolean(state.flags.part3_complete))

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }
  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }
  const typePulse = (key: string) => {
    sequence.current += 1
    window.dispatchEvent(new CustomEvent('sentinel:key-pulse', { detail: { key, sequence: sequence.current } }))
    beep(500 + (key.charCodeAt(0) % 9) * 24, 0.028)
  }
  const telemetry = (objectId: string, firstFlag?: string) => {
    const game = useGameStore.getState()
    game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId, wasFirstTime: firstFlag ? !game.flags[firstFlag] : true })
    if (firstFlag) game.setFlag(firstFlag)
  }

  const beginTerminal = () => {
    const game = useGameStore.getState()
    if (!game.flags.notebook_taken || !game.flags.elevator_returned_39 || game.flags.part3_complete) return
    clearTimers()
    game.setCinematic(true)
    game.setPrompt(null)
    game.setCheckpoint('sentinel-terminal-seat', game.location.spawn)
    game.setObjective('Use a caderneta e entre no SENTINEL.')
    telemetry('sentinel:session-open', 'sentinel_session_opened')
    setPhase('boot')
    setBootLines([])
    setNotebookPage(0)
    setInput('')
    window.dispatchEvent(new CustomEvent('sentinel:session-state', { detail: { active: true } }))
    const lines = [
      'SENTINEL v9.4.1 — MERIDIAN TOWER',
      '> CHECKING SENSORS........... 61% OPERATIONAL',
      '> CAMERAS.................... 12 OFFLINE (MIGRATION IN PROGRESS)',
      '> SYSTEM CLOCK............... 23:47 (SYNCHRONIZED)',
      '> OPEN INCIDENTS............. 1',
      '> OPERATOR................... --',
      'ACCESS MODE: _',
    ]
    lines.forEach((line, index) => schedule(() => {
      setBootLines((current) => [...current, line])
      beep(420 + index * 24, 0.035)
    }, 260 + index * 330))
    schedule(() => {
      setPhase('notebook')
      game.setObjective('Folheie a caderneta de Nascimento. [E]')
    }, 2900)
  }

  const startReplay = () => {
    clearTimers()
    setReplayTime(0.01)
    telemetry('sentinel:replay-started')
    schedule(() => setReplayTime(1), 700)
    schedule(() => setReplayTime(2), 1900)
    schedule(() => setReplayTime(3), 3100)
    schedule(() => setReplayTime(4), 4300)
    schedule(() => {
      const game = useGameStore.getState()
      game.setFlag('seven_seconds_seen')
      game.setFlag('he_knew')
      game.setCheckpoint('sentinel-seven-seconds', game.location.spawn)
      game.say('Note: the interruption begins 0.4 seconds after the gesture. He knew the buffer. Note: the operator is being recorded. Note: he knew it.')
      telemetry('sentinel:seven-seconds-seen')
      setPhase('vision')
    }, 5600)
  }

  useEffect(() => {
    const onOpen = () => beginTerminal()
    window.addEventListener('security:terminal-open', onOpen)
    return () => {
      clearTimers()
      window.removeEventListener('security:terminal-open', onOpen)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!part3Complete) return
    const game = useGameStore.getState()
    if (game.location.area !== 'security-center') return
    game.setCinematic(true)
    game.setObjective('PARTE 3 CONCLUÍDA — próximo: O Porão.')
    setPhase('ending')
    window.dispatchEvent(new CustomEvent('sentinel:session-state', { detail: { active: true } }))
  }, [part3Complete])

  useEffect(() => {
    if (phase !== 'results') return
    clearTimers()
    RESULT_LINES.forEach((_, index) => schedule(() => {
      setResultCount(index + 1)
      beep(640 + index * 12, 0.04)
    }, 280 + index * 360))
    schedule(() => {
      const game = useGameStore.getState()
      game.setFlag('canonical_query_complete')
      game.setBpm(90)
      game.say('Duas entradas... zero saídas... Às 23:12 eu já tava no chão há sete horas. Essa não fui eu. NENHUMA foi eu. E todas dizem PAULON, B.')
      game.say('Ele ficou com meu crachá. E devolveu... a cópia.')
      game.setCheckpoint('sentinel-query-complete', game.location.spawn)
      telemetry('sentinel:canonical-query-complete')
      setReplayTime(0)
      setPhase('replay')
    }, 3150)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const appendCharacter = (character: string) => {
    typePulse(character)
    const tremorChance = Math.max(0, bpm - 100) * 0.0007
    if (phase === 'query' && Math.random() < tremorChance) {
      setInput((current) => current + character + character)
      telemetry('sentinel:tremor-typo')
    } else {
      setInput((current) => current + character)
    }
  }

  useEffect(() => {
    if (phase === 'closed' || phase === 'boot' || phase === 'results' || phase === 'ending') return
    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()
      if (game.subtitle || game.subtitleQueue.length > 0) return

      if (phase === 'notebook') {
        if (event.code !== 'KeyE' || event.repeat) return
        event.preventDefault()
        typePulse('E')
        setNotebookPage(1)
        telemetry('sentinel:notebook-password-page', 'sentinel_password_page_seen')
        game.say('O senhor usou o próprio nome... Nascimento, o senhor era bom demais pra esse mundo.')
        game.say('TIP SAVED: PASSWORDS CONTAINING PERSONAL DATA ARE TRIVIAL TO GUESS. [LESSON: IDENTITY HYGIENE]')
        game.setFlag('lesson_identity')
        game.setCheckpoint('sentinel-credential-found', game.location.spawn)
        schedule(() => {
          setPhase('login')
          game.setObjective('Digite o comando de manutenção no terminal.')
        }, 650)
        return
      }

      if (phase === 'login') {
        if (event.code === 'Backspace') {
          event.preventDefault(); typePulse('BACKSPACE'); setInput((current) => current.slice(0, -1)); return
        }
        if (event.code === 'Enter') {
          event.preventDefault(); typePulse('ENTER')
          if (normalize(input) !== LOGIN_COMMAND) { setLoginError(true); telemetry('sentinel:login-rejected'); return }
          game.setFlag('sentinel_login')
          game.setFlag('second_victim_question')
          game.setCheckpoint('sentinel-login', game.location.spawn)
          game.say('Dois mortos confirmados... Eu conheço um.')
          game.setObjective('Leia o incidente #0001.')
          telemetry('sentinel:login-accepted')
          setInput(''); setLoginError(false); setPhase('incident'); return
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); appendCharacter(event.key) }
        return
      }

      if (phase === 'incident') {
        if (event.code !== 'Enter' && event.code !== 'Space') return
        event.preventDefault(); typePulse('ENTER'); setPhase('training'); game.setObjective('Responda ao TRAINING MODE. [Y/N]'); return
      }

      if (phase === 'training') {
        if (event.code !== 'KeyY' && event.code !== 'KeyN') return
        event.preventDefault(); typePulse(event.code === 'KeyY' ? 'Y' : 'N')
        if (event.code === 'KeyN') {
          game.setFlag('training_forced')
          game.say('Response recorded as YES. I record everything. It is my job.')
        } else game.setFlag('training_accepted')
        game.setFlag('training_mode')
        game.setBpm(110)
        game.setCheckpoint('sentinel-training-mode', game.location.spawn)
        telemetry('sentinel:training-mode')
        setPhase('query'); setInput(''); setQueryLine(0); setQueryAccepted([])
        game.setObjective('Construa a primeira consulta. TAB aceita o scaffold cinza.')
        return
      }

      if (phase === 'query') {
        const expected = QUERY_LINES[queryLine]
        if (didYouMean) {
          if (event.code !== 'KeyY' && event.code !== 'KeyN') return
          event.preventDefault(); typePulse(event.code === 'KeyY' ? 'Y' : 'N')
          if (event.code === 'KeyY') {
            setQueryAccepted((current) => [...current, expected]); setInput(''); setDidYouMean(false); telemetry('sentinel:typo-corrected')
            if (queryLine === QUERY_LINES.length - 1) setPhase('results'); else setQueryLine((current) => current + 1)
          } else { setInput(''); setDidYouMean(false) }
          return
        }
        if (event.code === 'Tab') { event.preventDefault(); typePulse('TAB'); setInput(expected); telemetry('sentinel:ghost-autocomplete'); return }
        if (event.code === 'Backspace') { event.preventDefault(); typePulse('BACKSPACE'); setInput((current) => current.slice(0, -1)); return }
        if (event.code === 'Enter') {
          event.preventDefault(); typePulse('ENTER')
          if (normalize(input) === normalize(expected)) {
            setQueryAccepted((current) => [...current, expected]); setInput('')
            if (queryLine === QUERY_LINES.length - 1) setPhase('results'); else setQueryLine((current) => current + 1)
          } else if (editDistanceOne(normalize(input), normalize(expected))) setDidYouMean(true)
          else telemetry('sentinel:query-rejected')
          return
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); appendCharacter(event.key) }
        return
      }

      if (phase === 'replay') {
        if (replayTime === 0 && (event.code === 'KeyY' || event.code === 'Enter')) { event.preventDefault(); typePulse('Y'); startReplay() }
        return
      }

      if (phase === 'vision') {
        if (event.code !== 'Enter' && event.code !== 'KeyE') return
        event.preventDefault(); typePulse('ENTER')
        game.setFlag('log_vision')
        game.setCheckpoint('sentinel-log-vision', game.location.spawn)
        game.setObjective('Você agora vê o que o SENTINEL vê.')
        telemetry('sentinel:log-vision-unlocked')
        setPhase('pact'); return
      }

      if (phase === 'pact') {
        if (event.code !== 'Enter' && event.code !== 'Space') return
        event.preventDefault(); typePulse('ENTER')
        game.setFlag('police_eta_armed'); game.setFlag('basement_incident_detected'); setPhase('choice')
        game.setObjective('Escolha a primeira triagem. [1] porão agora · [2] investigar logs'); return
      }

      if (phase === 'choice') {
        if (event.code !== 'Digit1' && event.code !== 'Digit2') return
        event.preventDefault()
        const actionChoice = event.code === 'Digit1'
        typePulse(actionChoice ? '1' : '2')
        game.setFlag(actionChoice ? 'choice_basement_now' : 'choice_logs_first')
        game.setFlag('triage_unlocked'); game.setFlag('terminal_unlocked'); game.setFlag('part3_complete')
        game.setCheckpoint('part3-terminal-complete', game.location.spawn)
        game.setObjective('PARTE 3 CONCLUÍDA — próximo: O Porão.')
        game.say('Começa aí, colega. Eu deixei o rastro limpinho pra você. Um abraço pro Nascimento.')
        telemetry(actionChoice ? 'sentinel:triage-basement-now' : 'sentinel:triage-logs-first')
        setPhase('ending')
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input, queryLine, didYouMean, replayTime, bpm])

  const screen = useMemo(() => {
    if (phase === 'boot') return bootLines
    if (phase === 'login') return ['SENTINEL v9.4.1 — MAINTENANCE ACCESS', '> CREDENTIAL SOURCE: LOCAL / PAPER RECOVERY', `> ${input || '▌'}`, ...(loginError ? ['> COMMAND REJECTED — CHECK SYNTAX'] : [])]
    if (phase === 'incident') return ['> CREDENTIAL ACCEPTED.', '> WELCOME, PAULON, B.', '', '┌─ INCIDENT #0001 — PRIORITY: CRITICAL ───────────────┐', '│ TYPE: INTRUSION / COMPROMISED IDENTITY             │', '│ ENTITY: BADGE 4471 — PAULON, B.                    │', '│ SUMMARY: 2 confirmed deaths. Unauthorized access    │', '│ in progress. Potential suspect: YOU.                │', '└──────────────────────────────────────────────────────┘', '', '[ENTER] CONTINUE']
    if (phase === 'training') return ['Detected operator without formal training.', 'TRAINING MODE available.', 'Do you wish to learn how to read this building? [Y/N]']
    if (phase === 'query') return ['AVAILABLE SOURCES: BadgeEvents, DoorEvents, ElevatorEvents, CamEvents, SysEvents', '', ...queryAccepted, `${input || '▌'}${input ? '' : `   ${QUERY_LINES[queryLine]}`}`, ...(didYouMean ? [`DID YOU MEAN: ${QUERY_LINES[queryLine]} ? [Y/N]`] : []), '', 'TAB: autocomplete · ENTER: execute line · BACKSPACE: correct']
    if (phase === 'results') return [...QUERY_LINES, '', ...RESULT_LINES.slice(0, resultCount)]
    if (phase === 'replay') return replayTime === 0 ? ['ASSOCIATED FOOTAGE AVAILABLE: CAM 37-BREAKROOM. PLAY? [Y/N]'] : ['CAM 37-BREAKROOM · 23:58:12', replayTime >= 2 ? '        ◯  ← HOODED FIGURE / FACE OCCLUDED' : '   PAULON, B. — BODY ON FLOOR', replayTime >= 3 ? '        👌  1.2s HOLD' : '', replayTime >= 4 ? '██████████ RECORDING INTERRUPTED ██████████' : '', replayTime >= 4 ? '23:58:12 → 23:58:19 (7 SECONDS MISSING)' : '']
    if (phase === 'vision') return ['QUERY COMPETENCE CONFIRMED.', 'TRAINING MODULE 01 COMPLETE: READING THE BUILDING.', 'VISUAL LOG OVERLAY: ENABLED.', '', 'From now on — you see what I see.', '', '[ENTER] STAND UP']
    if (phase === 'pact') return ['> POLICE DISPATCHED BY ALARM: YES', '> ESTIMATED ETA: 06:00 (5H REMAINING)', '> SYSTEM: 39% OPERATIONAL (MIGRATION IN PROGRESS)', '> NEW INCIDENTS DETECTED: 1', '└ MOVEMENT — BASEMENT — CAMERA 04 LOST SIGNAL 4 MIN AGO', '> RECOMMENDED ACTION: INVESTIGATE', '', '[ENTER] ACKNOWLEDGE']
    if (phase === 'choice') return ['TRIAGE', '', '[1] GO TO THE BASEMENT NOW', '[2] INVESTIGATE THROUGH THE LOGS']
    return []
  }, [phase, bootLines, input, loginError, queryAccepted, queryLine, didYouMean, resultCount, replayTime])

  if (phase === 'closed') return null
  return (
    <Html fullscreen zIndexRange={[80, 70]}>
      <div className="sentinel-shell" role="dialog" aria-label="SENTINEL v9.4.1 terminal">
        {phase === 'ending' ? (
          <div className="sentinel-ending">
            <strong>CAPÍTULO 1 — PARTE 3 · FIM</strong>
            <p>“Todo mundo deixa registro.<br />Agora você também está nos registros.”</p>
            <span>[UNLOCKED] LOG VIEW ● │ TERMINAL ● │ TRIAGE ●</span>
            <span>MITRE — TACTIC 1/14: RECONNAISSANCE</span>
            <small>PRÓXIMO — PARTE 4: “O PORÃO”</small>
          </div>
        ) : (
          <div className="sentinel-terminal">
            <header><span>SENTINEL v9.4.1</span><span>MERIDIAN TOWER · LOCAL CONSOLE</span></header>
            <pre>{screen.join('\n')}</pre>
            {phase === 'notebook' && (
              <aside className="sentinel-notebook">
                <strong>CADERNETA — NASCIMENTO</strong>
                {notebookPage === 0 ? <p>Folhas amareladas. Trinta anos de turnos, falhas, nomes e horários. <b>[E] folhear</b></p> : <p>“senha manutenção: <b>NASCIMENTO1994+ANO ATUAL</b><br />(não confio em memória, memória é volátil)”</p>}
              </aside>
            )}
            <footer><span>BPM {Math.round(bpm)}</span><span>SYSTEM CLOCK 23:47 · SYNCHRONIZED</span></footer>
          </div>
        )}
      </div>
    </Html>
  )
}
