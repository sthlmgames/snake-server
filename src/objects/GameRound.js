const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const CollisionHandler = require('../handler/CollisionHandler');
const Grid = require('./Grid');
const Fruit = require('./Fruit');
const BodyPart = require('./BodyPart');
const ChangeDirectionAction = require('../actions/ChangeDirectionAction');

class GameRound {

    constructor(networkHandler, players) {
        this._networkHandler = networkHandler;
        this._players = players;

        this._grid = new Grid();
        this._collisionHandler = new CollisionHandler(this._grid);

        this._actions = new Map();
        this._fruits = new Map();

        this._gameLoopTimer = null;

        this._networkHandler.on(NetworkHandler.events.PLAYER_ACTION, this._onPlayerAction.bind(this));

        this._initPlayers();
        this._initCountdown();

        this._networkHandler.emitGameRoundInitiated(this.initialState);
    }

    get initialState() {
        const initialState = {
            players: Array.from(this._players.values())
                .map(player => player.serialized),
        };

        return initialState;
    }

    // TODO rename to gameState
    get state() {
        const state = {
            players: Array.from(this._players.values())
                .filter(player => player.alive)
                .map(player => player.serialized),
            fruits: Array.from(this._fruits.values()).map(fruit => fruit.serialized),
        };

        return state;
    }

    _emitGameState() {
        this._networkHandler.emitGameState(this.state);
    }

    _initCountdown() {
        console.log('Room countdown...');

        let countdownValue = 3;
        let countdownTimer;

        countdownTimer = setInterval(() => {
            console.log(countdownValue);

            this._networkHandler.emitGameRoundCountdown(countdownValue);

            countdownValue--;

            if (countdownValue === -1) {
                clearInterval(countdownTimer);
                this._start();
            }
        }, settings.GAME_ROUND_COUNTDOWN_TIMER);
    }

    _initPlayers() {
        for (const [index, player] of Array.from(this._players.values()).entries()) {
            const position = (settings.startPositions[index] || this._grid.randomGridPosition);

            this._actions.set(player.id, new Map());

            player.grid = this._grid;
            player.initBody(position);
        }
    }

    _start() {
        console.log('Room round started');

        this._gameLoopTimer = setInterval(() => {
            this._handleExecuteActions();
            this._movePlayers();
            this._detectCollisions();

            this._emitGameState();
        }, settings.GAME_LOOP_TIMER);
    }

    _onPlayerAction(payload) {
        console.log('_onPlayerAction', payload.id);

        const player = this._players.get(payload.id);

        let action;

        switch (payload.action.type) {
            case settings.playerActions.DIRECTION_ACTION:
                action = new ChangeDirectionAction(player, payload.action);
                break;
            default:
                console.log('Unknown player action...');
        }

        this._addPlayerAction(player.id, action);
    }

    _addPlayerAction(playerId, action) {
        this._actions.get(playerId).set(action.id, action);
    }

    _handleExecuteActions() {
        for (const player of Array.from(this._players.values()).filter(player => player.alive)) {
            const playerActions = this._actions.get(player.id);

            // Change direction actions
            if (playerActions.get(ChangeDirectionAction.id)) {
                playerActions.get(ChangeDirectionAction.id).execute();
                playerActions.delete(ChangeDirectionAction.id);
            }
        }
    }

    _movePlayers() {
        for (const player of Array.from(this._players.values()).filter(player => player.alive)) {
            player.move();
        }
    }

    _createFruit() {
        const position = this._gridHandler.randomGridPosition,
            fruit = new Fruit(position);

        this._fruits.set(fruit.id, fruit);
        this._gridHandler.occupyGridSquare(fruit);
    }

    _removeFruit(fruit) {
        this._fruits.delete(fruit.id);
        this._gridHandler.removeObjectFromGrid(fruit);
    }

    _detectCollisions() {

        function detectPlayerWithWorldBoundsCollision() {
            // Player to world bounds collision
            if (settings.mode === settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
                for (const player of Array.from(this._players.values()).filter(player => player.alive)) {
                    const collision = this._collisionHandler.playerWithWorldBoundsCollision(player);

                    if (collision) {
                        player.kill();
                    }
                }
            }
        }

        function detectPlayerWithGameObjectCollision() {
            for (const player of Array.from(this._players.values()).filter(player => player.alive)) {
                const collision = this._collisionHandler.playerWithGameObjectCollision(player);

                if (!collision) {
                    return;
                }

                for (const gameObject of collision) {
                    // Player to fruit
                    if (gameObject instanceof Fruit) {
                        this._removeFruit(gameObject);
                        this._createFruit();
                        player.expandBody(player.head.position);
                        // Player to body part
                    } else if (gameObject instanceof BodyPart) {
                        playersToKill.push(player);

                        if (gameObject.type === BodyPart.HEAD) {
                            playersToKill.push(gameObject.player);
                        }
                    }
                }
            }
        }

        const playersToKill = [];

        detectPlayerWithWorldBoundsCollision.call(this);
        detectPlayerWithGameObjectCollision.call(this);

        // Kill players
        for (const player of playersToKill) {
            player.kill();
        }

        // Stop game round if we have a winner
        if (Array.from(this._players.values()).filter(player => player.alive).length === 1) {
            this.stop();
        }
    }

    stop() {
        console.log('Room round stopped');

        clearInterval(this._gameLoopTimer);
    }
}

module.exports = GameRound;