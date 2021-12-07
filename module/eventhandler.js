import { updateInitiative } from './combat.js';

export function chatEventHandler() {
  $(document)
    .find('#chat')
    .on('click', '.initiative-tracker-add', _onAddToInitiativeTracker);
}

function _onAddToInitiativeTracker(event) {
  event.stopPropagation();
  event.preventDefault();

  console.log('7th Sea 2E | Add to initiative tracker');
  const dataset = event.currentTarget.dataset;

  updateInitiative(dataset.actor, dataset.raise);
}
