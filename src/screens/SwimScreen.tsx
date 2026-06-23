import { SceneCanvas } from '../scene/SceneCanvas'

type SwimScreenProps = {
  emoji: string
}

export function SwimScreen({ emoji }: SwimScreenProps) {
  return (
    <div className="swim-screen">
      <SceneCanvas emoji={emoji} mode="swim" />
    </div>
  )
}
