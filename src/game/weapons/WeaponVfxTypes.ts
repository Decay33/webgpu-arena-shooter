import type { WeaponProjectileSpawn } from './WeaponTypes.ts'

export type HitMarker = {
  accentColor: string
  color: string
  createdAt: number
  glowColor: string
  id: number
  lifetimeMs: number
  normal: [number, number, number]
  position: [number, number, number]
  ringSize: number
  sparkLength: number
  sparkWidth: number
  size: number
}

export type MuzzleFlash = {
  color: string
  createdAt: number
  direction: [number, number, number]
  glowColor: string
  id: number
  length: number
  lifetimeMs: number
  lightDistance: number
  lightIntensity: number
  position: [number, number, number]
  secondaryColor: string
  size: number
  sparkColor: string
}

export type Tracer = {
  color: string
  createdAt: number
  end: [number, number, number]
  glowColor: string
  glowThickness: number
  id: number
  lifetimeMs: number
  start: [number, number, number]
  thickness: number
  tipColor: string
  tipSize: number
}

export type WeaponProjectile = WeaponProjectileSpawn & {
  distanceTraveled: number
  id: number
}

export type Explosion = {
  accentColor: string
  color: string
  createdAt: number
  glowColor: string
  id: number
  lifetimeMs: number
  lightDistance: number
  lightIntensity: number
  position: [number, number, number]
  ringColor: string
  ringSize: number
  sparkColor: string
  size: number
}

export type WeaponVfxController = {
  clear: () => void
  setProjectiles: (projectiles: readonly WeaponProjectile[]) => void
  spawnExplosion: (explosion: Explosion) => void
  spawnHitMarker: (marker: HitMarker) => void
  spawnMuzzleFlash: (flash: MuzzleFlash) => void
  spawnTracer: (tracer: Tracer) => void
}
