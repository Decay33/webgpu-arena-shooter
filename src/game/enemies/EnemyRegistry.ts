import type { DamageEvent } from '../health/HealthTypes.ts'
import type { EnemyDamageHandler, EnemyId } from './EnemyTypes.ts'

const colliderEnemyMap = new Map<number, EnemyId>()
const enemyDamageHandlers = new Map<EnemyId, EnemyDamageHandler>()

export function registerEnemyCollider(enemyId: EnemyId, colliderHandle: number) {
  colliderEnemyMap.set(colliderHandle, enemyId)
}

export function unregisterEnemyCollider(colliderHandle: number) {
  colliderEnemyMap.delete(colliderHandle)
}

export function registerEnemyDamageHandler(
  enemyId: EnemyId,
  handler: EnemyDamageHandler,
) {
  enemyDamageHandlers.set(enemyId, handler)

  return () => {
    enemyDamageHandlers.delete(enemyId)
  }
}

export function getEnemyIdByColliderHandle(
  colliderHandle: number,
): EnemyId | null {
  return colliderEnemyMap.get(colliderHandle) ?? null
}

export function applyDamageToEnemyByCollider(
  colliderHandle: number,
  damageEvent: DamageEvent,
) {
  const enemyId = getEnemyIdByColliderHandle(colliderHandle)

  if (!enemyId) {
    return false
  }

  const damageHandler = enemyDamageHandlers.get(enemyId)

  if (!damageHandler) {
    return false
  }

  damageHandler(damageEvent)

  return true
}
