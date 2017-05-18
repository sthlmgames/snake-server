const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || '/';

const NetworkHandler = require('./handler/NetworkHandler');

const Room = require('./objects/Room');

const networkHandler = new NetworkHandler(io);

const room = new Room(networkHandler);


// Necessary server stuff below
app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

server.listen(PORT, '0.0.0.0');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, PUBLIC_FOLDER, 'index.html'));
});


