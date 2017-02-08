const helper = require('../utils/helper');
const Player = require('./Player');
const Fruit = require('./Fruit');
const GridSquare = require('./GridSquare');
const CollisionHandler = require('./CollisionHandler');

class Game {

    constructor(settings) {
        this._settings = settings;
        this._grid = new Map();
        this._players = new Map();
        this._fruits = new Map();

        this._collisionHandler = new CollisionHandler(this._grid);

        // this._createFruit();
        this._initializeGrid();
    }

    get settings() {
        return this._settings;
    }

    get grid() {
        return this._grid;
    }

    get players() {
        return this._players;
    }

    get fruits() {
        return this._fruits;
    }

    _initializeGrid() {
        const gridSize = this._settings.GRID_SIZE;

        for (let x = 0; x <= this._settings.world.WIDTH; x = x + gridSize) {
            for (let y = 0; y <= this._settings.world.HEIGHT; y = y + gridSize) {
                const key = helper.generateGridKey({
                    x: x,
                    y: y,
                });

                this._grid.set(key, new GridSquare(key));
            }
        }
    }

    _createFruit() {
        const position = {
            x: helper.getRandomPosition(this._settings.world.WIDTH),
            y: helper.getRandomPosition(this._settings.world.HEIGHT),
        },
        fruit = new Fruit(this, position);

        this._fruits.set(fruit.id, fruit);
        this.occupyGridSquare(helper.generateGridKey(fruit.position), fruit);
    }

    _movePlayers() {
        for (const player of this._players.values()) {
            if (player.allowedToMove) {
                player.move();
            }
        }
    }

    _detectCollisions() {
        if (this._settings.mode === this._settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
            // Player to world bounds collision
            for (const player of this._players.values()) {
                const collision = this._collisionHandler.playerWithWorldBoundsCollision(player);

                player.allowedToMove = !collision;
            }
        }

        // Player to fruit collision
        for (const player of this._players.values()) {
            const collision = this._collisionHandler.playerWithGameObjectCollision(player),
                object = collision.object;

            if (object && object instanceof Fruit) {
                this._removeFruit(object.id);
                this.removeObjectFromGrid(collision.gridKey);
                this._createFruit();
                player.expandBody(player.head.position);
            }
        }
    }

    _removeFruit(id) {
        this._fruits.delete(id);
    }

    occupyGridSquare(gameObject) {
        const key = helper.generateGridKey(gameObject.position),
            gridSquare = this._grid.get(key);

        gridSquare.addGameObject(gameObject);
    }

    removeObjectFromGrid(gameObject) {
        const key = helper.generateGridKey(gameObject.position),
            gridSquare = this._grid.get(key);

        gridSquare.removeGameObject(gameObject);
    }

    startGameLoop(postGameLoopCallback) {
        setInterval(() => {
            this._detectCollisions();
            this._movePlayers();

            postGameLoopCallback();
        }, this._settings.GAME_LOOP_TIMER);
    }

    addPlayer(id) {
        const position = {
            x: helper.getRandomPosition(this._settings.world.WIDTH),
            y: helper.getRandomPosition(this._settings.world.HEIGHT),
        };
        const player = new Player(this, id, position, true);

        this._players.set(id, player);
    }

    removePlayer(id) {
        this._players.delete(id);
    }
}

module.exports = Game;