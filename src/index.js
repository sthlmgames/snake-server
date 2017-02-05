const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || '/';

const settings = require('./utils/settings');
const Game = require('./objects/Game');

function onConnection(socket) {
    console.log('connected: ', socket.id);

    game.addPlayer(socket.id);

    socket.emit(settings.messages.YOU_CONNECTED, {
        id: socket.id,
        settings: settings,
    });

    if (game.players.size === 1) {
        io.emit(settings.messages.GAME_STARTED);
    }

    emitGameState();

    socket.on(settings.messages.DISCONNECT, () => {
        onDisconnection(socket);
    });

    socket.on(settings.messages.PLAYER_ACTION, (payload) => {
        onPlayerAction(game.players.get(socket.id), payload);
    });
}

function onDisconnection(socket) {
    game.removePlayer(socket.id);
    emitGameState();
}

function onPlayerAction(player, action) {
    player.direction = action;
}

function onGameLoopFinished() {
    emitGameState();
}

function emitGameState() {
    io.emit(settings.messages.GAME_STATE, {
        players: [...game.players],
        fruits: [...game.fruits],
    });
}

io.on(settings.messages.CONNECT, onConnection);

const game = new Game(settings, onGameLoopFinished);

app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

server.listen(PORT);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, PUBLIC_FOLDER, 'index.html'));
});
