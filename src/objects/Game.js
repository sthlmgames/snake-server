const helper = require('../utils/helper');
const Player = require('./Player');
const Fruit = require('./Fruit');
const CollisionHandler = require('./CollisionHandler');

class Game {

    constructor(settings) {
        this._settings = settings;
        this._grid = new Map();
        this._players = new Map();
        this._fruits = new Map();

        this._collisionHandler = new CollisionHandler(this._grid);

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

    _occupySquare(key, gameObject) {
        this._grid.set(key, gameObject);
    }

    _createFruit() {
        const position = {
            x: helper.getRandomPosition(this._settings.world.WIDTH),
            y: helper.getRandomPosition(this._settings.world.HEIGHT),
        };
        const fruit = new Fruit(this, position);
        this._fruits.set(fruit.id, fruit);

        this._occupySquare(helper.generateGridKey(fruit.position), fruit);
    }

    _movePlayers() {
        for (const player of this._players.values()) {
            player.move();
        }
    }

    _removeObjectFromGrid(gridKey) {
        this._grid.delete(gridKey);
    }

    _detectCollisions() {
        // Player to fruit collision
        for (const player of this._players.values()) {
            const collision = this._collisionHandler.playerWithGameObjectCollision(player),
                object = collision.object;

            if (object && object instanceof Fruit) {
                this._removeFruit(object.id);
                this._removeObjectFromGrid(collision.gridKey);
                this._createFruit();
                player.expandBody(player.head.position);
            }
        }
    }

    _removeFruit(id) {
        this._fruits.delete(id);
    }

    startGameLoop(postGameLoopCallback) {
        setInterval(() => {
            this._movePlayers();
            this._detectCollisions();

            postGameLoopCallback();
        }, this._settings.GAME_LOOP_TIMER);
    }

    addPlayer(id) {
        const position = {
            x: helper.getRandomPosition(this._settings.world.WIDTH),
            y: helper.getRandomPosition(this._settings.world.HEIGHT),
        };
        const player = new Player(this, id, position);

        this._players.set(id, player);
    }

    removePlayer(id) {
        this._players.delete(id);
    }
}

module.exports = Game;