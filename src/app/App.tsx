import { ArenaCanvas } from '../game/renderer/canvas/ArenaCanvas.tsx'
import { DebugOverlay } from '../game/ui/overlays/DebugOverlay.tsx'
import './App.css'

export function App() {
  return (
    <main className="app-shell">
      <ArenaCanvas />
      <DebugOverlay />
    </main>
  )
}
