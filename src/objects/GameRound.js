const uuid = require('uuid/v4');
const EventEmitter = require('events').EventEmitter;

const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const CollisionHandler = require('../handler/CollisionHandler');
const Grid = require('./Grid');
const Fruit = require('./Fruit');
const BodyPart = require('./BodyPart');
const ChangeDirectionAction = require('../actions/ChangeDirectionAction');

class GameRound extends EventEmitter {

    constructor(networkHandler, players) {
        super();
        this._id = uuid();
        this._networkHandler = networkHandler;
        this._players = new Map(players);

        this._grid = new Grid();
        this._collisionHandler = new CollisionHandler(this._grid);

        this._actions = new Map();
        this._fruits = new Map();

        this._gameLoopTimerId = null;
        this._countdownTimerId = null;

        this._playerActionListenerId = null;

        this._initPlayers();
        this._initCountdown();

        this._networkHandler.emitGameRoundInitiated(this.initialState);
    }

    get id() {
        return this._id;
    }

    get initialState() {
        const initialState = {
            id: this.id,
            players: Array.from(this._players.values())
                .map(player => player.serialized),
        };

        return initialState;
    }

    // TODO rename to gameState
    get state() {
        const state = {
            id: this.id,
            players: Array.from(this._players.values())
                .filter(player => player.alive)
                .map(player => player.serialized),
            fruits: Array.from(this._fruits.values()).map(fruit => fruit.serialized),
        };

        return state;
    }

    _addListeners() {
        this._playerActionListenerId = this._onPlayerAction.bind(this);
        this._networkHandler.on(NetworkHandler.events.PLAYER_ACTION, this._playerActionListenerId);
    }

    _handleRemoveListeners() {
        if (this._playerActionListenerId) {
            this._networkHandler.removeListener(NetworkHandler.events.PLAYER_ACTION, this._playerActionListenerId);
        }
    }

    _emitGameState() {
        this._networkHandler.emitGameState(this.state);
    }

    _initCountdown() {
        console.log('Game round countdown...');

        let countdownValue = settings.COUNTDOWN_THRESHOLD;

        this._countdownTimerId = setInterval(() => {
            console.log(countdownValue);

            this._networkHandler.emitGameRoundCountdown(countdownValue);

            countdownValue--;

            if (countdownValue === -1) {
                this._stopCountdown();
                this._start();
            }
        }, settings.GAME_ROUND_COUNTDOWN_TIMER);
    }

    _stopCountdown() {
        clearInterval(this._countdownTimerId);
    }

    _resetPlayers() {
        for (const player of Array.from(this._players.values())) {
            player.reset();
        }
    }

    _initPlayers() {
        for (const [index, player] of Array.from(this._players.values()).entries()) {
            const position = (settings.startPositions[index] || this._grid.randomGridPosition);

            this._actions.set(player.id, new Map());

            player.playing = true;
            player.grid = this._grid;
            player.initBody(position);
        }
    }

    _start() {
        console.log('Game round started');

        this._addListeners();

        this._createFruit();

        this._gameLoopTimerId = setInterval(() => {
            this._handleExecuteActions();
            this._movePlayers();
            this._detectCollisions();

            if (this._handleDecideWinner()) {
                return; // clearInterval is called, but this._emitGameState below will still be called this tick if we don't return here
            }

            this._emitGameState();
        }, settings.GAME_LOOP_TIMER);
    }

    _onPlayerAction(payload) {
        const player = this._players.get(payload.id);

        // TODO should this function even run when a player not in this GameRound submits a player action?
        if (!player) {
            return;
        }

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
        const position = this._grid.randomGridPosition,
            fruit = new Fruit(position);

        this._fruits.set(fruit.id, fruit);
        this._grid.occupyGridSquare(fruit);
    }

    _removeFruit(fruit) {
        this._fruits.delete(fruit.id);
        this._grid.removeObjectFromGrid(fruit);
    }

    _handleDecideWinner() {
        const playersAlive = (Array.from(this._players.values()).filter(player => player.alive));
        const playersDead = (Array.from(this._players.values()).filter(player => !player.alive));
        const oneWinner = playersAlive.length === 1;
        const draw = playersDead.length === this._players.size;

        if (oneWinner) {
            this.stop();
            this.emit(GameRound.events.WINNER_DECIDED, playersAlive);
        } else if (draw) {
            this.stop();
            this.emit(GameRound.events.WINNER_DECIDED, playersDead);
        }

        return (oneWinner || draw);
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
                        // TODO include BodyPart type in this call, alternatively default in BodyPart constructor to 'BODY'
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
    }

    stop() {
        this._handleRemoveListeners();
        this._stopCountdown();
        this._resetPlayers();
        clearInterval(this._gameLoopTimerId);
    }
}

GameRound.events = {
    WINNER_DECIDED: 'on-winner-decided',
};

module.exports = GameRound;