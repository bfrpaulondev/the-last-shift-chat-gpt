import { useGameStore } from '../state/gameStore'

interface GameHudProps {
  isPointerLocked: boolean
}

export function GameHud({ isPointerLocked }: GameHudProps) {
  const objective = useGameStore((state) => state.objective)
  const prompt = useGameStore((state) => state.interactPrompt)
  const subtitle = useGameStore((state) => state.subtitle)
  const note = useGameStore((state) => state.note)

  return (
    <div className="game-hud">
      <div className="objective">▸ {objective}</div>

      {isPointerLocked && !note && <div className="crosshair" aria-hidden="true">+</div>}

      {isPointerLocked && prompt && !note && (
        <div className="interact-prompt">{prompt}</div>
      )}

      {subtitle && !note && <div className="subtitle">{subtitle}</div>}

      {note && (
        <div className="note-overlay">
          <article className="note-paper">
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            <span>[E] ou ESC para fechar</span>
          </article>
        </div>
      )}
    </div>
  )
}
