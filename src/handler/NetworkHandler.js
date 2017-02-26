const EventEmitter = require('events').EventEmitter;

const settings = require('../utils/settings');

class NetworkHandler extends EventEmitter {

    constructor(io) {
        super();

        this._io = io;

        this._io.on(settings.messages.CONNECT, this._onConnection.bind(this));
    }

    _onConnection(socket) {
        console.log('connected: ', socket.id);

        this.emit(NetworkHandler.events.CONNECT, socket.id);

        socket.emit(settings.messages.YOU_CONNECTED, {
            id: socket.id,
            settings: settings,
        });

        socket.on(settings.messages.DISCONNECT, () => {
            this._onDisconnection(socket);
        });

        socket.on(settings.messages.PLAYER_ACTION, payload => {
            this._onPlayerAction(socket, payload);
        });
    }

    _onDisconnection(socket) {
        this.emit(NetworkHandler.events.DISCONNECT, socket.id);
    }

    _onPlayerAction(socket, payload) {
        this.emit(NetworkHandler.events.PLAYER_ACTION, {
            id: socket.id,
            action: payload,
        });
    }

    emitGameStarted() {
        this._io.emit(settings.messages.GAME_STARTED);
    }

    emitGameState(gameState) {
        this._io.emit(settings.messages.GAME_STATE, gameState);
    }
}

NetworkHandler.events = {
    CONNECT: 'on-connection',
    DISCONNECT: 'on-disconnection',
    PLAYER_ACTION: 'on-player-action',
};

module.exports = NetworkHandler;