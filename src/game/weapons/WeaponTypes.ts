import type { HitResult } from '../combat/HitResult.ts'

export type WeaponId = 'rifle' | 'shotgun' | 'rocketLauncher'

export type WeaponFireType = 'hitscan' | 'projectile'

export type WeaponVisualSettings = {
  muzzleFlashColor: string
  muzzleFlashDistance: number
  muzzleFlashGlowColor: string
  muzzleFlashLength: number
  muzzleFlashLifetimeMs: number
  muzzleFlashSize: number
  impactColor: string
  impactGlowColor: string
  impactLifetimeMs: number
  impactRingSize: number
  impactSize: number
  tracerColor: string
  tracerGlowColor: string
  tracerGlowThickness: number
  tracerLifetimeMs: number
  tracerThickness: number
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
  explosionColor: string
  explosionGlowColor: string
  explosionLifetimeMs: number
  explosionRingColor: string
  explosionRingSize: number
  explosionSize: number
  glowColor: string
  maxDistance: number
  position: [number, number, number]
  size: number
  speed: number
  trailColor: string
  trailLength: number
  trailSize: number
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
