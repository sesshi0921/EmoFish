import { SceneCanvas } from '../scene/SceneCanvas'

type LandingScreenProps = {
  emoji: string
  state: 'falling' | 'flopping' | 'diving'
  onDive: () => void
  onLandingReady: () => void
}

export function LandingScreen({ emoji, state, onDive, onLandingReady }: LandingScreenProps) {
  return (
    <button className="landing-screen" type="button" onClick={onDive}>
      <SceneCanvas emoji={emoji} mode="landing" landingState={state} onLandingReady={onLandingReady} />
      <span className="landing-hint">{state === 'diving' ? 'Splash...' : 'Tap to let it dive'}</span>
    </button>
  )
}
