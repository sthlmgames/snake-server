const helper = require('../utils/helper');
const Player = require('./Player');
const Fruit = require('./Fruit');

class Game {

    constructor(settings, postGameLoopCallback) {
        this._settings = settings;
        this._grid = new Map();
        this._players = new Map();
        this._fruits = new Map();
        this._postGameLoopCallback = postGameLoopCallback;

        this._createFruit();

        this._startGameLoop();
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

    _detectCollisions() {
        // Player to fruit collision
        for (const player of this._players.values()) {
            const gridKey = helper.generateGridKey(player.head.position),
                objectOnSquare = this._grid.get(gridKey);

            if (objectOnSquare) {
                this.removeFruit(objectOnSquare.id);
                this._grid.delete(gridKey);
                this._createFruit();
                player.expandBody(player.head.position);
            }
        }
    }

    _startGameLoop() {
        setInterval(() => {
            this._movePlayers();
            this._detectCollisions();

            this._postGameLoopCallback();
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

    removeFruit(id) {
        this._fruits.delete(id);
    }
}

module.exports = Game;