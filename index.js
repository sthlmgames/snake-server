const app = require('express')();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

const messages = {
    YOU_CONNECTED: 'you-connected',
    GAME_STARTED: 'game-started',
    PLAYERS: 'players',
}

class BodyPart {

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
}

class Player {

    constructor(id) {
        this._id = id;
        this._bodyParts = [];

        console.log(game.players.size);
        if (game.players.size === 0) {
          this._bodyParts.push(new BodyPart(0,0));
        } else if (game.players.size === 1) {
          this._bodyParts.push(new BodyPart(55,55));
        } else if (game.players.size === 2) {
          this._bodyParts.push(new BodyPart(155,155));
        }
    }
}

class Game {

    constructor() {
        this._players = new Map();

        //this._io.emit(messages.GAME_STARTED);

        //this._io.emit(messages.PLAYERS, [...this._players]);
    }

    get players () {
      return this._players;
    }

    addPlayer(id) {
      this._players.set(id, new Player(id));
    }

    removePlayer(id) {
      this._players.delete(id);
    }
}

const game = new Game();

function onConnection(socket) {
    console.log('connected: ', socket.id);

    game.addPlayer(socket.id);

    socket.emit(messages.YOU_CONNECTED, {
        id: socket.id
    });

    if (game.players.size === 1) {
        //game.start();
        // game = new Game(io);

        io.emit(messages.GAME_STARTED);
    }

    io.emit(messages.PLAYERS, [...game.players]);

    socket.on('disconnect', () => {
      console.log('disconnected: ', socket.id);
      game.removePlayer(socket.id);
      io.emit(messages.PLAYERS, [...game.players]);
    });
}

io.on('connection', onConnection);

http.listen(port, 'localhost', function() {
    console.log("listening on *:" + port);
});
