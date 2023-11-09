export const SOCKET_NAME = 'system.svnsea2e';
export const actions = {
  characterChange: 'characterChanged',
};

export function registerSocketListeners() {
  game.socket.on(SOCKET_NAME, (payload) => {
    switch (payload.type) {
      case actions.characterChange:
        refreshToolbox(payload);
        break;

      default:
        console.warn(
          new Error('L5R5E | This socket event is not supported'),
          payload,
        );
        break;
    }
  });
}

export function emitCharacterChange() {
  game.svnsea2e.toolbox.refresh();
  game.socket.emit(SOCKET_NAME, {
    type: actions.characterChange,
  });
}

function refreshToolbox() {
  game.svnsea2e.toolbox.refresh();
}
