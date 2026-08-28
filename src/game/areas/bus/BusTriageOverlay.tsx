import { useBusTriageStore } from './busTriageStore'

export function BusTriageOverlay() {
  const triagePhase = useBusTriageStore((state) => state.triagePhase)
  const focusedCandidate = useBusTriageStore((state) => state.focusedCandidate)
  const markProgress = useBusTriageStore((state) => state.markProgress)
  const feedback = useBusTriageStore((state) => state.feedback)
  const pinPhase = useBusTriageStore((state) => state.pinPhase)

  return (
    <div className="bus-system-overlay" aria-live="polite">
      {triagePhase === 'alert' && (
        <div className="triage-alert">
          <div className="triage-alert-text">ALGO ESTÁ FORA DO PADRÃO.</div>
          {focusedCandidate && (
            <div className="triage-mark-wrap">
              <div
                className="triage-progress-ring"
                style={{ '--triage-progress': `${Math.round(markProgress * 360)}deg` } as React.CSSProperties}
              >
                <span>{Math.round(markProgress * 100)}</span>
              </div>
              <span>SEGURE E</span>
            </div>
          )}
        </div>
      )}

      {feedback && triagePhase !== 'alert' && (
        <div className="triage-feedback">{feedback}</div>
      )}
      {feedback === 'PADRÃO COMPATÍVEL.' && triagePhase === 'alert' && (
        <div className="triage-feedback triage-feedback-small">{feedback}</div>
      )}

      {pinPhase === 'active' && (
        <div className="pin-qte">
          <div className="pin-shadow" />
          <div className="pin-phone-panel">
            <span>PIN</span>
            <strong>••••</strong>
          </div>
          <div className="pin-warning">!</div>
          <div className="pin-action">[E] COBRIR A TELA</div>
        </div>
      )}
    </div>
  )
}
