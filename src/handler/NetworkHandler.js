const settings = require('../utils/settings');

class NetworkHandler {

    constructor(io, game) {
        this._io = io;
        this._game = game;

        this._io.on(settings.messages.CONNECT, this._onConnection.bind(this));
    }

    _onConnection(socket) {
        console.log('connected: ', socket.id);

        this._game.addPlayer(socket.id);

        socket.emit(settings.messages.YOU_CONNECTED, {
            id: socket.id,
            settings: settings,
        });

        if (this._game.players.size === 1) {
            this._io.emit(settings.messages.GAME_STARTED);
        }

        this._emitGameState();

        socket.on(settings.messages.DISCONNECT, () => {
            this._onDisconnection(socket);
        });

        socket.on(settings.messages.PLAYER_ACTION, (payload) => {
            this._onPlayerAction(this._game.players.get(socket.id), payload);
        });
    }

    _onDisconnection(socket) {
        this._game.removePlayer(socket.id);
        this._emitGameState();
    }

    _onPlayerAction(player, action) {
        const playerDisallowed = (player.direction === settings.playerActions.directions[action.value].disallowed);

        if (playerDisallowed) {
            return;
        }

        player.direction = action.value;
    }

    _emitGameState() {
        const gameState = {
            players: [...this._game.players],
            fruits: [...this._game.fruits],
        };

        this._io.emit(settings.messages.GAME_STATE, gameState);
    }

    onGameLoopFinished() {
        this._emitGameState();
    }
}

module.exports = NetworkHandler;