export type HitTargetType = 'enemy' | 'world'

export type HitResult = {
  colliderHandle: number
  distance: number
  enemyId?: string
  normal: [number, number, number]
  point: [number, number, number]
  targetType: HitTargetType
}
