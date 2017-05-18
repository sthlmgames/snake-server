const EventEmitter = require('events').EventEmitter;

const settings = require('../utils/settings');

class NetworkHandler extends EventEmitter {

    constructor(io) {
        super();

        this._io = io;

        this._io.on(settings.messages.CONNECT, this._onConnection.bind(this));
    }

    _onConnection(socket) {
        console.log('Player connected', socket.id);

        socket.emit(settings.messages.YOU_CONNECTED, {
            id: socket.id,
            settings: settings,
        });

        this.emit(NetworkHandler.events.CONNECT, socket.id);

        socket.on(settings.messages.CLIENT_LOADED, () => {
            this.emit(NetworkHandler.events.CLIENT_LOADED, socket.id);
        });

        socket.on(settings.messages.DISCONNECT, () => {
            this._onDisconnection(socket);
        });

        socket.on(settings.messages.PLAYER_ACTION, payload => {
            this._onPlayerAction(socket, payload);
        });
    }

    _onDisconnection(socket) {
        console.log('Player disconnected', socket.id);
        this.emit(NetworkHandler.events.DISCONNECT, socket.id);
    }

    _onPlayerAction(socket, payload) {
        this.emit(NetworkHandler.events.PLAYER_ACTION, {
            id: socket.id,
            action: payload,
        });
    }

    emitRoomState(roomState) {
        this._io.emit(settings.messages.ROOM_STATE, roomState);
    }

    emitGameRoundInitiated(players) {
        this._io.emit(settings.messages.GAME_ROUND_INITIATED, players);
    }

    emitGameRoundCountdown(countdownValue) {
        this._io.emit(settings.messages.GAME_ROUND_COUNTDOWN, countdownValue);
    }

    emitGameState(gameState) {
        this._io.emit(settings.messages.GAME_STATE, gameState);
    }
}

NetworkHandler.events = {
    CONNECT: 'on-connection',
    DISCONNECT: 'on-disconnection',
    PLAYER_ACTION: 'on-player-action',
    CLIENT_LOADED: 'on-client-loaded',
};

module.exports = NetworkHandler;