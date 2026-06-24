import { useEffect, useRef, useState } from 'react'
import { InputScreen } from './screens/InputScreen'
import { LandingScreen } from './screens/LandingScreen'
import { SwimScreen } from './screens/SwimScreen'
import { DebugScreen } from './screens/DebugScreen'
import { isSupportedEmoji } from './lib/emoji'
import './App.css'

type AppPhase = 'input' | 'landing' | 'swim'

function App() {
  const params = new URLSearchParams(window.location.search)

  if (window.location.pathname.endsWith('/debug') || params.get('debug') === '1' || window.location.hash === '#debug') {
    return <DebugScreen />
  }

  const initialEmoji = params.get('fish') ?? ''
  const hasInitialFish = isSupportedEmoji(initialEmoji)
  const [phase, setPhase] = useState<AppPhase>(hasInitialFish ? 'landing' : 'input')
  const [emoji, setEmoji] = useState(hasInitialFish ? initialEmoji : '')
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
    }, 1300)

    return () => {
      if (diveTimerRef.current !== null) {
        window.clearTimeout(diveTimerRef.current)
      }
    }
  }, [landingState, phase])

  const handleLaunch = (nextEmoji: string) => {
    setEmoji(nextEmoji)
    setPhase('landing')
  }

  const handleLandingReady = () => {
    setLandingState((current) => (current === 'falling' ? 'flopping' : current))
  }

  const handleDive = () => {
    if (phase === 'landing' && landingState !== 'diving') {
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
