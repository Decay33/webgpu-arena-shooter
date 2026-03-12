import type {
  WeaponDefinition,
  WeaponProjectileSpawn,
  WeaponVisualSettings,
} from '../weapons/WeaponTypes.ts'

export const HITSCAN_RIFLE_VISUALS: WeaponVisualSettings = {
  impactColor: '#ff6b4a',
  impactGlowColor: '#ffd8a8',
  impactLifetimeMs: 120,
  impactRingSize: 0.32,
  impactSize: 0.12,
  muzzleFlashColor: '#ffe08a',
  muzzleFlashGlowColor: '#fff6c7',
  muzzleFlashDistance: 0.56,
  muzzleFlashLength: 0.34,
  muzzleFlashLifetimeMs: 50,
  muzzleFlashSize: 0.16,
  tracerColor: '#fff0b3',
  tracerGlowColor: '#fff7da',
  tracerGlowThickness: 0.1,
  tracerLifetimeMs: 58,
  tracerThickness: 0.04,
}

export const HITSCAN_RIFLE_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.11,
  damage: 30,
  displayName: 'Rifle',
  fireType: 'hitscan',
  id: 'rifle',
  maxDistance: 160,
  visuals: HITSCAN_RIFLE_VISUALS,
}

export const SHOTGUN_PELLET_PATTERN: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [-0.62, 0.12],
  [0.62, 0.12],
  [-0.18, -0.52],
  [0.18, -0.52],
  [-0.82, -0.28],
  [0.82, -0.28],
  [0, 0.72],
]

export const HITSCAN_SHOTGUN_PELLET_DAMAGE = 14
export const HITSCAN_SHOTGUN_SPREAD_ANGLE_DEGREES = 4.8
export const HITSCAN_SHOTGUN_VISUALS: WeaponVisualSettings = {
  impactColor: '#ff8f52',
  impactGlowColor: '#ffd7a1',
  impactLifetimeMs: 145,
  impactRingSize: 0.42,
  impactSize: 0.16,
  muzzleFlashColor: '#ffb703',
  muzzleFlashGlowColor: '#ffe29a',
  muzzleFlashDistance: 0.6,
  muzzleFlashLength: 0.52,
  muzzleFlashLifetimeMs: 82,
  muzzleFlashSize: 0.24,
  tracerColor: '#ffd166',
  tracerGlowColor: '#fff2b2',
  tracerGlowThickness: 0.15,
  tracerLifetimeMs: 105,
  tracerThickness: 0.065,
}

export const HITSCAN_SHOTGUN_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.48,
  damage: HITSCAN_SHOTGUN_PELLET_DAMAGE * SHOTGUN_PELLET_PATTERN.length,
  displayName: 'Shotgun',
  fireType: 'hitscan',
  id: 'shotgun',
  maxDistance: 30,
  visuals: HITSCAN_SHOTGUN_VISUALS,
}

export const ROCKET_LAUNCHER_VISUALS: WeaponVisualSettings = {
  impactColor: '#ffb267',
  impactGlowColor: '#fff0c9',
  impactLifetimeMs: 0,
  impactRingSize: 0,
  impactSize: 0,
  muzzleFlashColor: '#ff9f1c',
  muzzleFlashGlowColor: '#ffe0a3',
  muzzleFlashDistance: 0.7,
  muzzleFlashLength: 0.68,
  muzzleFlashLifetimeMs: 110,
  muzzleFlashSize: 0.28,
  tracerColor: '#ffd08a',
  tracerGlowColor: '#ffe6b8',
  tracerGlowThickness: 0.18,
  tracerLifetimeMs: 0,
  tracerThickness: 0.1,
}

export const ROCKET_PROJECTILE_CONFIG: Omit<
  WeaponProjectileSpawn,
  'damage' | 'direction' | 'maxDistance' | 'position'
> = {
  blastRadius: 4.6,
  color: '#ff7b00',
  explosionColor: '#ff8c42',
  explosionGlowColor: '#ffd19a',
  explosionLifetimeMs: 240,
  explosionRingColor: '#ffdca8',
  explosionRingSize: 4.6,
  explosionSize: 3.4,
  glowColor: '#ffd18c',
  size: 0.24,
  speed: 42,
  trailColor: '#ffb347',
  trailLength: 1.35,
  trailSize: 0.22,
}

export const ROCKET_LAUNCHER_DEFINITION: WeaponDefinition = {
  cooldownSeconds: 0.66,
  damage: 120,
  displayName: 'Rocket Launcher',
  fireType: 'projectile',
  id: 'rocketLauncher',
  maxDistance: 120,
  visuals: ROCKET_LAUNCHER_VISUALS,
}
