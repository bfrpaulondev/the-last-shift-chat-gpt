import { useGameStore } from '../state/gameStore'

interface GameHudProps {
  isPointerLocked: boolean
}

export function GameHud({ isPointerLocked }: GameHudProps) {
  const objective = useGameStore((state) => state.objective)
  const prompt = useGameStore((state) => state.interactPrompt)
  const subtitle = useGameStore((state) => state.subtitle)
  const note = useGameStore((state) => state.note)
  const blackout = useGameStore((state) => state.blackout)
  const cinematic = useGameStore((state) => state.cinematic)
  const demoEnded = useGameStore((state) => state.demoEnded)

  const noteClassName = note?.title.startsWith('CRACHÁ')
    ? 'note-paper badge-note'
    : 'note-paper'

  return (
    <div className="game-hud">
      {!demoEnded && <div className="objective">▸ {objective}</div>}

      {isPointerLocked && !note && !cinematic && !demoEnded && (
        <div className="crosshair" aria-hidden="true">+</div>
      )}

      {isPointerLocked && prompt && !note && !cinematic && !demoEnded && (
        <div className="interact-prompt">{prompt}</div>
      )}

      {subtitle && !note && !demoEnded && <div className="subtitle">{subtitle}</div>}

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

      {demoEnded && (
        <div className="demo-ending">
          <div className="demo-ending-copy">
            <p>AQUELE DIA PARECIA UM DIA NORMAL.</p>
            <p>O PRÉDIO ANOTOU TODOS OS SEUS PASSOS.</p>
            <p>OS DELE... TAMBÉM.</p>
            <h1>O ÚLTIMO TURNO</h1>
            <h2>CAPÍTULO 1 — &quot;O TURNO NORMAL&quot; (em produção)</h2>
            <span>[DEMO TÉCNICA 0.1]</span>
            <button type="button" onClick={() => window.location.reload()}>
              [ REINICIAR ]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
