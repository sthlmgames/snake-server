const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || '/';

const NetworkHandler = require('./handler/NetworkHandler');
const GridHandler = require('./handler/GridHandler');
const CollisionHandler = require('./handler/CollisionHandler');

const Game = require('./objects/Game');

const gridHandler = new GridHandler();
const collisionHandler = new CollisionHandler(gridHandler);

const game = new Game(gridHandler, collisionHandler);

// TODO should this object know about Game? broadcast events instead?
const networkHandler = new NetworkHandler(io, game);

app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

server.listen(PORT);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, PUBLIC_FOLDER, 'index.html'));
});

game.startGameLoop(networkHandler.onGameLoopFinished.bind(networkHandler));

