const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const Player = require('./Player');
const GameRound = require('./GameRound');

class Game {

    constructor(gridHandler, collisionHandler, networkHandler) {
        this._players = new Map();

        this._gameRound = null;

        this._gridHandler = gridHandler;
        this._collisionHandler = collisionHandler;
        this._networkHandler = networkHandler;

        this._networkHandler.on(NetworkHandler.events.CONNECT, this._onPlayerConnected.bind(this));
        this._networkHandler.on(NetworkHandler.events.CLIENT_LOADED, this._onClientLoaded.bind(this));
        this._networkHandler.on(NetworkHandler.events.DISCONNECT, this._onPlayerDisconnected.bind(this));
    }

    get state() {
        const state = {
            players: Array.from(this._players.values())
                .filter(player => player.alive)
                .map(player => player.serialized),
            fruits: [],
        };

        return state;
    }

    _emitGameState() {
        this._networkHandler.emitGameState(this.state);
    }

    _onPlayerConnected(id) {
        this._addPlayer(id);
    }

    _onClientLoaded(id) {
        this._players.get(id).ready = true;

        this._emitGameState();

        const allPlayersLoaded = (Array.from(this._players.values()).filter(player => player.ready).length === this._players.size);

        if (this._players.size === settings.REQUIRED_NUMBER_OF_PLAYERS_FOR_GAME_ROUND && allPlayersLoaded) {
            this._gameRound = new GameRound(this._networkHandler, this._gridHandler, this._collisionHandler, this._players);
        }
    }

    _onPlayerDisconnected(id) {
        this._removePlayer(id);

        this._emitGameState();

        if (this._players.size < settings.REQUIRED_NUMBER_OF_PLAYERS_FOR_GAME_ROUND && this._gameRound) {
            this._gameRound.stop();
        }
    }

    _addPlayer(id) {
        const position = (settings.startPositions[this._players.size] || this._gridHandler.randomGridPosition),
            freeColors = Player.colors.filter(color => !color.occupied),
            randomColor = freeColors[Math.floor(Math.random() * freeColors.length)],
            player = new Player(id, position, randomColor, true, this._gridHandler);

        randomColor.occupied = true;

        this._players.set(id, player);

        return player;
    }

    _removePlayer(id) {
        const player = this._players.get(id);

        player.kill();

        player.color.occupied = false;

        this._players.delete(id);
    }
}

module.exports = Game;
