const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 50,
    PLAYER_MOVE_TIMER: 40,
    GAME_LOOP_TIMER: 100,
    world: {
        WIDTH: 800,
        HEIGHT: 500
    },

    playerActions: {
        directions: {
            UP: 'up',
            DOWN: 'down',
            LEFT: 'left',
            RIGHT: 'right',
        },
    },

    messages: {
        YOU_CONNECTED: 'you-connected',
        GAME_STARTED: 'game-started',
        GAME_STATE: 'game-state',

        PLAYER_ACTION: 'player-action',

        DISCONNECT: 'disconnect',
        CONNECT: 'connection',
    },
};

module.exports = settings;
