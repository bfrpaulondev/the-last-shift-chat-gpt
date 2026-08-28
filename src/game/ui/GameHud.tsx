import { useGameStore } from '../state/gameStore'
import { GameClock } from './GameClock'

interface GameHudProps {
  isPointerLocked: boolean
  muted: boolean
}

export function GameHud({ isPointerLocked, muted }: GameHudProps) {
  const objective = useGameStore((state) => state.objective)
  const prompt = useGameStore((state) => state.interactPrompt)
  const subtitle = useGameStore((state) => state.subtitle)
  const note = useGameStore((state) => state.note)
  const blackout = useGameStore((state) => state.blackout)
  const cinematic = useGameStore((state) => state.cinematic)
  const scareActive = useGameStore((state) => state.scareActive)
  const demoEnded = useGameStore((state) => state.demoEnded)
  const backendOnline = useGameStore((state) => state.backendOnline)
  const progressSaved = useGameStore((state) => state.progressSaved)

  const noteClassName = note?.title.startsWith('CRACHÁ')
    ? 'note-paper badge-note'
    : 'note-paper'

  return (
    <div className="game-hud">
      {!demoEnded && <div className="objective">▸ {objective}</div>}

      {!demoEnded && (
        <div className="hud-status">
          <GameClock />
          <div className="mute-indicator">{muted ? 'MUDO' : 'SOM'} [M]</div>
        </div>
      )}

      {isPointerLocked && !note && !cinematic && !scareActive && !demoEnded && (
        <div className="crosshair" aria-hidden="true">+</div>
      )}

      {isPointerLocked && prompt && !note && !cinematic && !scareActive && !demoEnded && (
        <div className="interact-prompt">{prompt}</div>
      )}

      {subtitle && !note && !demoEnded && (
        <div className="subtitle">
          <div>{subtitle}</div>
          <span className="subtitle-continue">[ESPAÇO] continuar</span>
        </div>
      )}

      {note && !demoEnded && (
        <div className="note-overlay">
          <article className={noteClassName}>
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            <span>[E] ou ESC para fechar</span>
          </article>
        </div>
      )}

      {blackout && !demoEnded && <div className="scene-blackout" />}
      {scareActive && !demoEnded && <div className="scare-flash" aria-hidden="true" />}

      {demoEnded && (
        <div className="demo-ending">
          <div className="demo-ending-copy">
            <p>AQUELE DIA PARECIA UM DIA NORMAL.</p>
            <p>O PRÉDIO ANOTOU TODOS OS SEUS PASSOS.</p>
            <p>OS DELE... TAMBÉM.</p>
            <h1>O ÚLTIMO TURNO</h1>
            <h2>CAPÍTULO 1 — &quot;O TURNO NORMAL&quot; (em produção)</h2>
            <span>[DEMO TÉCNICA 0.1]</span>
            {backendOnline && progressSaved && (
              <span className="progress-saved">Progresso salvo ✓</span>
            )}
            <button type="button" onClick={() => window.location.reload()}>
              [ REINICIAR ]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
