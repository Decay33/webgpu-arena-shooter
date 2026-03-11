import { usePlayerHealthStore } from '../../player/health/playerHealthStore.ts'
import { useRendererStore } from '../../renderer/state/rendererStore.ts'
import {
  getWeaponDefinition,
  WEAPON_SLOT_ORDER,
} from '../../weapons/WeaponRegistry.ts'
import { usePlayerWeaponStore } from '../../weapons/playerWeaponStore.ts'

export function DebugOverlay() {
  const rendererMode = useRendererStore((state) => state.rendererMode)
  const fpsEstimate = useRendererStore((state) => state.fpsEstimate)
  const initializationState = useRendererStore(
    (state) => state.initializationState,
  )
  const pointerLocked = useRendererStore((state) => state.pointerLocked)
  const playerPosition = useRendererStore((state) => state.playerPosition)
  const playerGrounded = useRendererStore((state) => state.playerGrounded)
  const playerAlive = usePlayerHealthStore((state) => state.alive)
  const playerCurrentHealth = usePlayerHealthStore(
    (state) => state.currentHealth,
  )
  const playerMaxHealth = usePlayerHealthStore((state) => state.maxHealth)
  const respawnRemainingSeconds = usePlayerHealthStore(
    (state) => state.respawnRemainingSeconds,
  )
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const unlockedWeapons = usePlayerWeaponStore((state) => state.unlockedWeapons)
  const currentWeaponName = getWeaponDefinition(currentWeaponId).displayName
  const unlockedWeaponNames = WEAPON_SLOT_ORDER.filter(
    (weaponId) => unlockedWeapons[weaponId],
  )
    .map((weaponId) => getWeaponDefinition(weaponId).displayName)
    .join(', ')

  return (
    <aside className="debug-overlay">
      <p className="debug-overlay__title">Renderer Debug</p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">mode</span>
        <span className="debug-overlay__value">
          {rendererMode ?? 'Detecting'}
        </span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">init</span>
        <span className="debug-overlay__value">{initializationState}</span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">fps</span>
        <span className="debug-overlay__value">
          {fpsEstimate > 0 ? fpsEstimate : '--'}
        </span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">player</span>
        <span className="debug-overlay__value">
          {playerPosition.map((value) => value.toFixed(2)).join(', ')}
        </span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">grounded</span>
        <span className="debug-overlay__value">
          {playerGrounded ? 'yes' : 'no'}
        </span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">health</span>
        <span className="debug-overlay__value">
          {playerCurrentHealth}/{playerMaxHealth}
        </span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">weapon</span>
        <span className="debug-overlay__value">{currentWeaponName}</span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">unlocked</span>
        <span className="debug-overlay__value">{unlockedWeaponNames}</span>
      </p>
      <p className="debug-overlay__row">
        <span className="debug-overlay__label">alive</span>
        <span className="debug-overlay__value">
          {playerAlive ? 'yes' : 'no'}
        </span>
      </p>
      {respawnRemainingSeconds !== null ? (
        <p className="debug-overlay__row">
          <span className="debug-overlay__label">respawn</span>
          <span className="debug-overlay__value">
            {respawnRemainingSeconds.toFixed(1)}s
          </span>
        </p>
      ) : null}
      {!pointerLocked ? (
        <p className="debug-overlay__hint">Click to capture mouse</p>
      ) : null}
    </aside>
  )
}
