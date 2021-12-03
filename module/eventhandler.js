export function chatEventHandler() {
  $(document).find('#chat').on('click', '.initiative-tracker-add', _onAddToInitiativeTracker)
}

function _onAddToInitiativeTracker(event) {
    event.stopPropagation();

    console.log('7th Sea 2E | Add to initiative tracker');
    const dataset = event.currentTarget.dataset;

    const activeCombat = game.combats.filter(combat => combat.scene.active);

    if (activeCombat.length === 0) {
        ui.notifications.error(`No combat is active`);
        return;
    }

    activeCombat.forEach(combat => {
        const actors = combat.combatants
            .filter(c => c._actor._id === dataset.actor);

        if (actors.length === 0) {
            ui.notifications.error(`This actor does not participate in this combat.`);
            return;
        }

        combat.combatants
            .filter(c => c._actor._id === dataset.actor)
            .map(c => c.update({ initiative: parseFloat(dataset.raise) }));
    });
};