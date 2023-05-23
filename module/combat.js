export function updateInitiative(actorId, raise) {
  const nRaise = parseFloat(raise);
  const activeCombat = game.combats.filter((combat) => combat.active);

  if (activeCombat.length > 0) {
    activeCombat.forEach((combat) => {
      const actors = combat.combatants.filter((c) => c.actor.id === actorId);

      if (actors.length > 0) {
        combat.combatants
          .filter((c) => c.actor.id === actorId)
          .map((c) => {
            c.update({ initiative: parseFloat(nRaise) });
          });
      }
    });
  }

  game.actors
    .filter((a) => a.id === actorId)
    .map((a) => {
      a.update({ data: { initiative: nRaise } });
    });
}
