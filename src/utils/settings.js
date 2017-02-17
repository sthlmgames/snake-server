const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 50,
    GAME_LOOP_TIMER: 100,
    modes: {
        FREE_MOVEMENT: 'free-movement',
        BLOCKED_BY_WORLD_BOUNDS: 'blocked-by-world-bounds',
    },
    world: {
        WIDTH: 800,
        HEIGHT: 500
    },

    playerActions: {
        directions: {
            UP: {
                value: 'UP',
            },
            DOWN: {
                value: 'DOWN',
            },
            LEFT: {
                value: 'LEFT',
            },
            RIGHT: {
                value: 'RIGHT',
            },
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

const directions = settings.playerActions.directions;

directions.UP.disallowed = directions.DOWN.value;
directions.DOWN.disallowed = directions.UP.value;
directions.LEFT.disallowed = directions.RIGHT.value;
directions.RIGHT.disallowed = directions.LEFT.value;

settings.mode = settings.modes.FREE_MOVEMENT;
// settings.mode = settings.modes.BLOCKED_BY_WORLD_BOUNDS;

module.exports = settings;
