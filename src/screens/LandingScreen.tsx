import { SceneCanvas } from '../scene/SceneCanvas'

type LandingScreenProps = {
  emoji: string
  state: 'falling' | 'flopping' | 'diving'
  onDive: () => void
  onLandingReady: () => void
}

export function LandingScreen({ emoji, state, onDive, onLandingReady }: LandingScreenProps) {
  return (
    <div className="landing-screen">
      <SceneCanvas emoji={emoji} mode="landing" landingState={state} onLandingReady={onLandingReady} />
      <button className="landing-tap-layer" type="button" aria-label="Dive" onClick={onDive} />
      <span className="landing-hint">{state === 'diving' ? 'Splash...' : 'Tap to let it dive'}</span>
    </div>
  )
}
