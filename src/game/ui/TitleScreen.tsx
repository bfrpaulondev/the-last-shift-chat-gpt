import { useEffect, useState } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface TitleScreenProps {
  phase: 'title' | 'transition'
  onStart: () => void
}

const TITLE = 'O ÚLTIMO TURNO / THE LAST SHIFT'

export function TitleScreen({ phase, onStart }: TitleScreenProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= TITLE.length) {
          window.clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, 55)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const prepareAudio = () => {
      void audioEngine.init().then(() => {
        audioEngine.startTitleNoise()
      }).catch(() => undefined)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' || phase !== 'title') {
        return
      }

      event.preventDefault()
      void audioEngine.init().then(() => {
        audioEngine.startTitleNoise()
        audioEngine.playAlarm()
        onStart()
      }).catch(() => {
        onStart()
      })
    }

    window.addEventListener('pointerdown', prepareAudio, { once: true })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('pointerdown', prepareAudio)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onStart, phase])

  return (
    <div className={`title-screen ${phase === 'transition' ? 'title-screen--leaving' : ''}`}>
      <div className="title-screen__copy">
        <h1>{TITLE.slice(0, visibleCharacters)}<span className="title-cursor">_</span></h1>
        <p>[ PRESSIONE ENTER ]</p>
      </div>
    </div>
  )
}
