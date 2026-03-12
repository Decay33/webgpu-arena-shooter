import { ArenaCanvas } from '../game/renderer/canvas/ArenaCanvas.tsx'
import { GameplayHud } from '../game/ui/hud/GameplayHud.tsx'
import { DebugOverlay } from '../game/ui/overlays/DebugOverlay.tsx'
import { DebugOverlayHotkeys } from '../game/ui/overlays/DebugOverlayHotkeys.tsx'
import { GameOverOverlay } from '../game/ui/overlays/GameOverOverlay.tsx'
import './App.css'

export function App() {
  return (
    <main className="app-shell">
      <ArenaCanvas />
      <GameplayHud />
      <DebugOverlay />
      <DebugOverlayHotkeys />
      <GameOverOverlay />
    </main>
  )
}
