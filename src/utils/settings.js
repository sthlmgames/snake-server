const DIRECTION_ACTION = 'direction-action';

const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 20,
    GAME_LOOP_TIMER: 500,
    modes: {
        FREE_MOVEMENT: 'free-movement',
        BLOCKED_BY_WORLD_BOUNDS: 'blocked-by-world-bounds',
    },
    world: {
        WIDTH: 400,
        HEIGHT: 200
    },

    playerActions: {
        DIRECTION_ACTION: DIRECTION_ACTION,
        UP: {
            type: DIRECTION_ACTION,
            value: 'UP',
        },
        DOWN: {
            type: DIRECTION_ACTION,
            value: 'DOWN',
        },
        LEFT: {
            type: DIRECTION_ACTION,
            value: 'LEFT',
        },
        RIGHT: {
            type: DIRECTION_ACTION,
            value: 'RIGHT',
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

const playerActions = settings.playerActions;

playerActions.UP.disallowed = playerActions.DOWN.value;
playerActions.DOWN.disallowed = playerActions.UP.value;
playerActions.LEFT.disallowed = playerActions.RIGHT.value;
playerActions.RIGHT.disallowed = playerActions.LEFT.value;

settings.mode = settings.modes.FREE_MOVEMENT;
// settings.mode = settings.modes.BLOCKED_BY_WORLD_BOUNDS;

module.exports = settings;
