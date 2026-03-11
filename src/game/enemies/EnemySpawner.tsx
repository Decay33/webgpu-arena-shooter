import { EnemyBot } from './EnemyBot.tsx'
import { useEnemySystem } from './EnemySystem.ts'

export function EnemySpawner() {
  const { damageEnemy, enemies } = useEnemySystem()

  return (
    <>
      {enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => (
          <EnemyBot enemy={enemy} key={enemy.id} onDamage={damageEnemy} />
        ))}
    </>
  )
}
