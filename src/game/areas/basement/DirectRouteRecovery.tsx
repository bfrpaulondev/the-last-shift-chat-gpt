import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'

export function DirectRouteRecovery() {
  const directRoute = useGameStore((state) => Boolean(state.flags.choice_basement_now))
  const camFrozen = useGameStore((state) => Boolean(state.flags.cam04_frozen))
  const stairsKnown = useGameStore((state) => Boolean(state.flags.stairs_route_deduced))
  const cloneKnown = useGameStore((state) => Boolean(state.flags.clone_confirmed))

  useEffect(() => {
    if (!directRoute || !camFrozen || (stairsKnown && cloneKnown)) return

    const game = useGameStore.getState()
    if (!game.flags.stairs_route_deduced) {
      game.setFlag('stairs_route_deduced')
      game.say('O buffer local ainda tem o elevador: 00:15:34, DOWN, 4471. Nenhum UP depois disso.')
      game.say('Desceu às 00:15. E nunca subiu. As escadas não têm leitor no subsolo... ele sobe pelo concreto.')
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'part4:direct-route-m1-recovery',
        wasFirstTime: true,
      })
    }

    const timer = window.setTimeout(() => {
      const latest = useGameStore.getState()
      if (latest.location.area !== 'basement' || latest.flags.clone_confirmed) return
      latest.setFlag('clone_confirmed')
      latest.setFlag('mitre_initial_access')
      latest.say('E o mesmo 4471 aparece às 00:20:11 no DOOR 38-SEC. No mesmo minuto em que ele já estava na rota do subsolo.')
      latest.say('O mesmo crachá, no mesmo minuto, em dois lugares. Crachá não se duplica... copiam.')
      latest.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: 'part4:direct-route-m2-recovery',
        wasFirstTime: true,
      })
    }, 2400)

    return () => window.clearTimeout(timer)
  }, [directRoute, camFrozen, stairsKnown, cloneKnown])

  return null
}
