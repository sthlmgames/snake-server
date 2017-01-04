

const app = require('express')();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

const messages = {
  YOU_CONNECTED: 'you-connected',
  GAME_STARTED: 'game-started',
  PLAYERS: 'players',
}

// class BodyPart {
//     constructor() {
//         this._x = 0;
//         this._y = 0;
//     }
// }

class Player {
    constructor (id) {
        this._id = id;
        // this._bodyParts = [];
        // this.expandBody();
        // setTimeout(() => {
        //   this.expandBody();
        // }, 3000)
    }

    // expandBody() {
    //      this._bodyParts.push(new BodyPart());
    //      this._socket.emit('server-message', {
    //        player: this._bodyParts
    //      });
    //      console.log(this);
    // }
}

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

class Game {

  constructor(io, players) {
    this._io = io;
    this._players = players;

    this._io.emit(messages.GAME_STARTED);

    this._io.emit(messages.PLAYERS, [...this._players]);
  }

}

const players = new Map();

let game;

http.listen(port, 'localhost', function() {
  console.log("listening on *:" + port);
});

io.on('connection', (socket) => {
  console.log('connected: ', socket.id);
  players.set(socket.id, new Player(socket.id));

  socket.emit(messages.YOU_CONNECTED, {
    id: socket.id
  });

  socket.on('disconnect', () => {
    console.log('disconnected: ', socket.id);
    players.delete(socket.id);
  });

  if (players.size === 1 & !game) {
    game = new Game(io, players);
  }
});

