import type { HitResult } from '../combat/HitResult.ts'

export type WeaponType = 'hitscanRifle'

export type WeaponShotVisuals = {
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

export type WeaponShotResult = {
  damage: number
  hit: HitResult | null
  maxDistance: number
  visuals: WeaponShotVisuals
  weaponType: WeaponType
}

export type Weapon = {
  cooldownSeconds: number
  tryFire: (context: WeaponFireContext) => WeaponShotResult | null
  type: WeaponType
}
