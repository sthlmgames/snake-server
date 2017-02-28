const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const Player = require('./Player');
const Fruit = require('./Fruit');
const ChangeDirectionCommand = require('../actions/ChangeDirectionCommand');

class Game {

    constructor(gridHandler, collisionHandler, networkHandler) {
        this._players = new Map();
        this._fruits = new Map();

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
            players: [...this._players],
            fruits: [...this._fruits],
        };

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

        const player = this._players.get(payload.id),
            command = new ChangeDirectionCommand(player, payload.action.value);

        command.execute();
    }

    _addPlayer(id) {
        const position = this._gridHandler.randomGridPosition,
            freeColors = Player.colors.filter(color => !color.occupied),
            randomColor = freeColors[Math.floor(Math.random() * freeColors.length)],
            player = new Player(id, position, randomColor, true, this._gridHandler);

        randomColor.occupied = true;

        this._players.set(id, player);
    }

    _removePlayer(id) {
        const player = this._players.get(id);

        player.color.occupied = false;

        this._players.delete(id);
    }

    _movePlayers() {
        for (const player of this._players.values()) {
            if (player.allowedToMove) {
                player.move();
            }
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
            for (const player of this._players.values()) {
                const collision = this._collisionHandler.playerWithWorldBoundsCollision(player);

                player.allowedToMove = !collision;
            }
        }

        // Player to fruit collision
        for (const player of this._players.values()) {
            const collision = this._collisionHandler.playerWithGameObjectCollision(player);

            for (const gameObject of collision) {
                if (gameObject instanceof Fruit) {
                    this._removeFruit(gameObject);
                    this._createFruit();
                    player.expandBody(player.head.position);
                }
            }
        }
    }

    _removeFruit(fruit) {
        this._fruits.delete(fruit.id);
        this._gridHandler.removeObjectFromGrid(fruit);
    }

    startGameLoop() {
        setInterval(() => {
            this._movePlayers();
            this._detectCollisions();

            this._emitGameState();
        }, settings.GAME_LOOP_TIMER);
    }
}

module.exports = Game;