import type { HitResult } from '../combat/HitResult.ts'

export type WeaponId = 'rifle' | 'shotgun' | 'rocketLauncher'

export type WeaponFireType = 'hitscan' | 'projectile'

export type WeaponVisualSettings = {
  muzzleFlashColor: string
  muzzleFlashDistance: number
  muzzleFlashLifetimeMs: number
  muzzleFlashSize: number
  tracerColor: string
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

export type WeaponShotResult = {
  definition: WeaponDefinition
  traces: WeaponTraceResult[]
}

export type Weapon = {
  definition: WeaponDefinition
  tryFire: (context: WeaponFireContext) => WeaponShotResult | null
}
