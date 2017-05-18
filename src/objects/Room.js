const settings = require('../utils/settings');
const NetworkHandler = require('../handler/NetworkHandler');
const Player = require('./Player');
const GameRound = require('./GameRound');

class Room {

    constructor(networkHandler) {
        this._players = new Map();

        this._gameRound = null;

        this._networkHandler = networkHandler;

        this._networkHandler.on(NetworkHandler.events.CONNECT, this._onPlayerConnected.bind(this));
        this._networkHandler.on(NetworkHandler.events.CLIENT_LOADED, this._onClientLoaded.bind(this));
        this._networkHandler.on(NetworkHandler.events.DISCONNECT, this._onPlayerDisconnected.bind(this));
    }

    get state() {
        const state = {
            players: Array.from(this._players.values())
                .map(player => player.serialized),
        };

        return state;
    }

    _emitRoomState() {
        this._networkHandler.emitRoomState(this.state);
    }

    _onPlayerConnected(id) {
        this._addPlayer(id);
    }

    _onClientLoaded(id) {
        this._players.get(id).ready = true;

        this._emitRoomState();

        this._handleCreateGameRound();
    }

    _handleCreateGameRound() {
        const allPlayersLoaded = (Array.from(this._players.values()).filter(player => player.ready).length === this._players.size);

        if (this._players.size === settings.REQUIRED_NUMBER_OF_PLAYERS_FOR_GAME_ROUND && allPlayersLoaded) {
            this._gameRound = new GameRound(this._networkHandler, this._players,
                function onWinnerDecided() {
                    // TODO change this recursive behaviour(it never ends)
                    this._handleCreateGameRound();
                }.bind(this));
        }
    }

    _onPlayerDisconnected(id) {
        this._removePlayer(id);

        const stopGameRound = this._players.size === 0 && this._gameRound;

        if (stopGameRound) {
            this._gameRound.stop();
        }

        this._emitRoomState();
    }

    _addPlayer(id) {
        const freeColors = Player.colors.filter(color => !color.occupied);
        const randomColor = freeColors[Math.floor(Math.random() * freeColors.length)];
        const player = new Player(id, randomColor);

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

module.exports = Room;
