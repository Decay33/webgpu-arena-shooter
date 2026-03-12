import { useScoreStore } from '../../core/state/scoreStore.ts'
import { useEnemySystem } from '../../enemies/EnemySystem.ts'
import { usePlayerHealthStore } from '../../player/health/playerHealthStore.ts'
import { getWeaponDefinition } from '../../weapons/WeaponRegistry.ts'
import { usePlayerWeaponStore } from '../../weapons/playerWeaponStore.ts'

function Crosshair() {
  return (
    <div aria-hidden className="hud-crosshair">
      <span className="hud-crosshair__line hud-crosshair__line--top" />
      <span className="hud-crosshair__line hud-crosshair__line--right" />
      <span className="hud-crosshair__dot" />
      <span className="hud-crosshair__line hud-crosshair__line--bottom" />
      <span className="hud-crosshair__line hud-crosshair__line--left" />
    </div>
  )
}

export function GameplayHud() {
  const currentWeaponId = usePlayerWeaponStore((state) => state.currentWeaponId)
  const ammoByWeapon = usePlayerWeaponStore((state) => state.ammoByWeapon)
  const currentHealth = usePlayerHealthStore((state) => state.currentHealth)
  const maxHealth = usePlayerHealthStore((state) => state.maxHealth)
  const currentScore = useScoreStore((state) => state.currentScore)
  const { currentWave, enemiesRemaining } = useEnemySystem()

  const currentWeaponDefinition = getWeaponDefinition(currentWeaponId)
  const currentWeaponAmmo = ammoByWeapon[currentWeaponId]

  return (
    <div className="hud-root">
      <div className="hud-panel hud-panel--status">
        <p className="hud-panel__eyebrow">Arena Status</p>
        <p className="hud-panel__row">
          <span className="hud-panel__label">Score</span>
          <span className="hud-panel__value">{currentScore}</span>
        </p>
        <p className="hud-panel__row">
          <span className="hud-panel__label">Wave</span>
          <span className="hud-panel__value">{currentWave}</span>
        </p>
        <p className="hud-panel__row">
          <span className="hud-panel__label">Enemies</span>
          <span className="hud-panel__value">{enemiesRemaining}</span>
        </p>
      </div>

      <div className="hud-panel hud-panel--player">
        <p className="hud-panel__eyebrow">Loadout</p>
        <p className="hud-panel__weapon">{currentWeaponDefinition.displayName}</p>
        <p className="hud-panel__ammo">
          {currentWeaponAmmo.currentAmmo}/{currentWeaponAmmo.maxAmmo}
        </p>
        <p className="hud-panel__row">
          <span className="hud-panel__label">Health</span>
          <span className="hud-panel__value">
            {currentHealth}/{maxHealth}
          </span>
        </p>
      </div>

      <Crosshair />
    </div>
  )
}
