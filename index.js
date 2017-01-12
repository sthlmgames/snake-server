const app = require('express')();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 20,
    PLAYER_MOVE_TIMER: 40,
    // directions: {
    //     UP: 'up',
    //     DOWN: 'down',
    //     RIGHT: 'right',
    //     LEFT: 'left'
    // },
    world: {
        WIDTH: 800,
        HEIGHT: 500
    }
};

const messages = {
    YOU_CONNECTED: 'you-connected',
    GAME_STARTED: 'game-started',
    PLAYERS: 'players',
}

class BodyPart {

    constructor(position) {
        this._x = position.x;
        this._y = position.y;
    }
}

class Player {

    constructor(id, position) {
        this._id = id;
        this._bodyParts = [];
        this._bodyParts.push(new BodyPart(position));

        // if (game.players.size === 0) {
        //   this._bodyParts.push(new BodyPart(0,0));
        // } else if (game.players.size === 1) {
        //   this._bodyParts.push(new BodyPart(55,55));
        // } else if (game.players.size === 2) {
        //   this._bodyParts.push(new BodyPart(155,155));
        // }
    }
}

class Game {

    constructor() {
        this._players = new Map();
    }

    get players() {
        return this._players;
    }

    getRandomPosition(dimension) {
        const maxValue = dimension - settings.GRID_SIZE,
            randomValue = Math.round(Math.random() * maxValue),
            result = Math.round(randomValue / settings.GRID_SIZE) * settings.GRID_SIZE;

        return result;
    }

    addPlayer(id) {
        const position = {
            x: this.getRandomPosition(settings.world.WIDTH),
            y: this.getRandomPosition(settings.world.HEIGHT),
        };

        console.log(position);

        this._players.set(id, new Player(id, position));
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
        id: socket.id,
        settings: settings,
    });

    if (game.players.size === 1) {
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

http.listen(port, 'localhost', function () {
    console.log("listening on *:" + port);
});
