import { useEffect, useMemo, useRef, useState } from 'react'
import { InputScreen } from './screens/InputScreen'
import { LandingScreen } from './screens/LandingScreen'
import { SwimScreen } from './screens/SwimScreen'
import './App.css'

type AppPhase = 'input' | 'landing' | 'swim'

function App() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [emoji, setEmoji] = useState('')
  const [landingState, setLandingState] = useState<'falling' | 'flopping' | 'diving'>('falling')
  const landingTimerRef = useRef<number | null>(null)
  const diveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (landingTimerRef.current !== null) {
        window.clearTimeout(landingTimerRef.current)
      }
      if (diveTimerRef.current !== null) {
        window.clearTimeout(diveTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (phase !== 'landing') {
      return
    }

    setLandingState('falling')
    landingTimerRef.current = window.setTimeout(() => {
      setLandingState('diving')
    }, 5000)

    return () => {
      if (landingTimerRef.current !== null) {
        window.clearTimeout(landingTimerRef.current)
      }
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'landing' || landingState !== 'diving') {
      return
    }

    if (landingTimerRef.current !== null) {
      window.clearTimeout(landingTimerRef.current)
    }

    diveTimerRef.current = window.setTimeout(() => {
      setPhase('swim')
    }, 900)

    return () => {
      if (diveTimerRef.current !== null) {
        window.clearTimeout(diveTimerRef.current)
      }
    }
  }, [landingState, phase])

  const canDive = useMemo(
    () => phase === 'landing' && (landingState === 'flopping' || landingState === 'diving'),
    [landingState, phase],
  )

  const handleLaunch = (nextEmoji: string) => {
    setEmoji(nextEmoji)
    setPhase('landing')
  }

  const handleLandingReady = () => {
    setLandingState((current) => (current === 'falling' ? 'flopping' : current))
  }

  const handleDive = () => {
    if (canDive) {
      setLandingState('diving')
    }
  }

  return (
    <main className="app-shell" data-phase={phase}>
      <section className={`screen screen-input${phase === 'input' ? ' is-active' : ''}`}>
        <InputScreen onLaunch={handleLaunch} />
      </section>

      <section className={`screen screen-landing${phase === 'landing' ? ' is-active' : ''}`}>
        <LandingScreen
          emoji={emoji}
          state={landingState}
          onDive={handleDive}
          onLandingReady={handleLandingReady}
        />
      </section>

      <section className={`screen screen-swim${phase === 'swim' ? ' is-active' : ''}`}>
        <SwimScreen emoji={emoji} />
      </section>
    </main>
  )
}

export default App
