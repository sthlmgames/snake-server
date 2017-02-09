const Player = require('./Player');
const Fruit = require('./Fruit');

class Game {

    constructor(settings, gridHandler, collisionHandler) {
        this._settings = settings;
        this._grid = new Map();
        this._players = new Map();
        this._fruits = new Map();

        this._gridHandler = gridHandler;
        this._collisionHandler = collisionHandler;

        this._createFruit();
    }

    get settings() {
        return this._settings;
    }

    get players() {
        return this._players;
    }

    get fruits() {
        return this._fruits;
    }

    _createFruit() {
        const position = this._gridHandler.randomGridPosition,
            fruit = new Fruit(this, position);

        this._fruits.set(fruit.id, fruit);
        this._gridHandler.occupyGridSquare(fruit);
    }

    _movePlayers() {
        for (const player of this._players.values()) {
            if (player.allowedToMove) {
                player.move();
            }
        }
    }

    _detectCollisions() {
        // Player to world bounds collision
        if (this._settings.mode === this._settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
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

    startGameLoop(postGameLoopCallback) {
        setInterval(() => {
            this._movePlayers();
            this._detectCollisions();

            postGameLoopCallback();
        }, this._settings.GAME_LOOP_TIMER);
    }

    addPlayer(id) {
        const position = this._gridHandler.randomGridPosition,
            player = new Player(this, id, position, true, this._gridHandler);

        this._players.set(id, player);
    }

    removePlayer(id) {
        this._players.delete(id);
    }
}

module.exports = Game;