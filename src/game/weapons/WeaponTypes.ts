import type { HitResult } from '../combat/HitResult.ts'

export type WeaponId = 'rifle' | 'shotgun' | 'rocketLauncher'

export type WeaponFireType = 'hitscan' | 'projectile'

export type WeaponVisualSettings = {
  impactAccentColor: string
  impactColor: string
  impactGlowColor: string
  impactLifetimeMs: number
  impactRingSize: number
  impactSparkLength: number
  impactSparkWidth: number
  impactSize: number
  muzzleFlashColor: string
  muzzleFlashDistance: number
  muzzleFlashGlowColor: string
  muzzleFlashLength: number
  muzzleFlashLifetimeMs: number
  muzzleFlashLightDistance: number
  muzzleFlashLightIntensity: number
  muzzleFlashSecondaryColor: string
  muzzleFlashSize: number
  muzzleFlashSparkColor: string
  tracerColor: string
  tracerGlowColor: string
  tracerGlowThickness: number
  tracerLifetimeMs: number
  tracerThickness: number
  tracerTipColor: string
  tracerTipSize: number
}

export type WeaponRay = {
  direction: [number, number, number]
  origin: [number, number, number]
}

export type WeaponRaycastRequest = {
  direction: [number, number, number]
  maxDistance: number
  origin: [number, number, number]
}

export type WeaponFireContext = {
  now: number
  ray: WeaponRay
  raycast: (request: WeaponRaycastRequest) => HitResult | null
}

export type WeaponDefinition = {
  cooldownSeconds: number
  damage: number
  displayName: string
  fireType: WeaponFireType
  id: WeaponId
  maxDistance: number
  visuals: WeaponVisualSettings
}

export type WeaponTraceResult = {
  damage: number
  direction: [number, number, number]
  hit: HitResult | null
}

export type WeaponProjectileSpawn = {
  blastRadius: number
  color: string
  damage: number
  direction: [number, number, number]
  explosionAccentColor: string
  explosionColor: string
  explosionGlowColor: string
  explosionLifetimeMs: number
  explosionLightDistance: number
  explosionLightIntensity: number
  explosionRingColor: string
  explosionRingSize: number
  explosionSparkColor: string
  explosionSize: number
  glowColor: string
  maxDistance: number
  position: [number, number, number]
  size: number
  speed: number
  trailAccentColor: string
  trailColor: string
  trailLength: number
  trailPulseSize: number
  trailSize: number
  trailTipColor: string
}

export type WeaponShotResult = {
  definition: WeaponDefinition
  projectiles: WeaponProjectileSpawn[]
  traces: WeaponTraceResult[]
}

export type Weapon = {
  definition: WeaponDefinition
  tryFire: (context: WeaponFireContext) => WeaponShotResult | null
}
