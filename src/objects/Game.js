const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const Player = require('./Player');
const Fruit = require('./Fruit');
const BodyPart = require('./BodyPart');
const ChangeDirectionAction = require('../actions/ChangeDirectionAction');

class Game {

    constructor(gridHandler, collisionHandler, networkHandler) {
        this._players = new Map();
        this._fruits = new Map();
        this._actions = new Map();

        this._gridHandler = gridHandler;
        this._collisionHandler = collisionHandler;
        this._networkHandler = networkHandler;

        this._networkHandler.on(NetworkHandler.events.CONNECT, this._onPlayerConnected.bind(this));
        this._networkHandler.on(NetworkHandler.events.DISCONNECT, this._onPlayerDisconnected.bind(this));
        this._networkHandler.on(NetworkHandler.events.PLAYER_ACTION, this._onPlayerAction.bind(this));

        this._createFruit();
    }

    get state() {
        const state = {
            players: Array.from(this._players.values())
                .filter(player => player.alive)
                .map(player => player.serialized),
            fruits: Array.from(this._fruits.values()).map(fruit => fruit.serialized),
        };

        // console.log(Array.from(this._players.values()).map(player => player.serialized));

        return state;
    }

    _emitGameState() {
        this._networkHandler.emitGameState(this.state);
    }

    _onPlayerConnected(id) {
        console.log('_onPlayerConnected', id);

        this._addPlayer(id);

        if (this._players.size === 1) {
            this._networkHandler.emitGameStarted();
        }

        this._emitGameState();
    }

    _onPlayerDisconnected(id) {
        console.log('_onPlayerDisconnected', id);

        this._removePlayer(id);

        this._emitGameState();
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

        this._addAction(player.id, action);
    }

    _addPlayer(id) {
        const position = this._gridHandler.randomGridPosition,
            freeColors = Player.colors.filter(color => !color.occupied),
            randomColor = freeColors[Math.floor(Math.random() * freeColors.length)],
            player = new Player(id, position, randomColor, true, this._gridHandler);

        randomColor.occupied = true;

        this._players.set(id, player);
        this._actions.set(id, new Map());
    }

    _removePlayer(id) {
        const player = this._players.get(id);

        player.kill();

        player.color.occupied = false;

        this._players.delete(id);
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

    _detectCollisions() {
        // Player to world bounds collision
        if (settings.mode === settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
            for (const player of Array.from(this._players.values()).filter(player => player.alive)) {
                const collision = this._collisionHandler.playerWithWorldBoundsCollision(player);

                if (collision) {
                    player.kill();
                }
            }
        }

        // Player to game object collision
        const playersToKill = [];

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

        // Kill players
        for (const player of playersToKill) {
            player.kill();
        }
    }

    _removeFruit(fruit) {
        this._fruits.delete(fruit.id);
        this._gridHandler.removeObjectFromGrid(fruit);
    }

    _addAction(playerId, action) {
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

    startGameLoop() {
        setInterval(() => {
            this._handleExecuteActions();
            this._movePlayers();
            this._detectCollisions();

            this._emitGameState();
        }, settings.GAME_LOOP_TIMER);
    }
}

module.exports = Game;
