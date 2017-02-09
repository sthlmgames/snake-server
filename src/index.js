const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || '/';

const settings = require('./utils/settings');
const NetworkHandler = require('./objects/NetworkHandler');
const Game = require('./objects/Game');

const game = new Game(settings);
const networkHandler = new NetworkHandler(io, game);

app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

server.listen(PORT);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, PUBLIC_FOLDER, 'index.html'));
});

game.startGameLoop(networkHandler.onGameLoopFinished.bind(networkHandler));

