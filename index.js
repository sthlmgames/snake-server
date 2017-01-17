const app = require('express')();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 20,
    PLAYER_MOVE_TIMER: 40,
    world: {
        WIDTH: 800,
        HEIGHT: 500
    },

    playerActions: {
        directions: {
            UP: 'up',
            DOWN: 'down',
            LEFT: 'left',
            RIGHT: 'right',
        },
    },

    messages: {
        YOU_CONNECTED: 'you-connected',
        GAME_STARTED: 'game-started',
        PLAYERS: 'players',

        PLAYER_ACTION: 'player-action',

        DISCONNECT: 'disconnect',
        CONNECT: 'connection',
    },
};

class BodyPart {

    constructor(position) {
        this._x = position.x;
        this._y = position.y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    set x(newX) {
        this._x = newX;
    }

    set y(newY) {
        this._y = newY;
    }
}

class Player {

    constructor(id, position) {
        this._id = id;
        this._bodyParts = [];
        this._bodyParts.push(new BodyPart(position));
    }

    move(direction) {
        const bodyPart = this._bodyParts[0];

        if (direction === settings.playerActions.directions.UP) {
            bodyPart.y -= settings.GRID_SIZE;
        } else if (direction === settings.playerActions.directions.DOWN) {
            bodyPart.y += settings.GRID_SIZE;
        } else if (direction === settings.playerActions.directions.LEFT) {
            bodyPart.x -= settings.GRID_SIZE;
        } else if (direction === settings.playerActions.directions.RIGHT) {
            bodyPart.x += settings.GRID_SIZE;
        }
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

    socket.emit(settings.messages.YOU_CONNECTED, {
        id: socket.id,
        settings: settings,
    });

    if (game.players.size === 1) {
        io.emit(settings.messages.GAME_STARTED);
    }

    io.emit(settings.messages.PLAYERS, [...game.players]);

    socket.on(settings.messages.DISCONNECT, () => {
        onDisconnection(socket);
    });

    socket.on(settings.messages.PLAYER_ACTION, (payload) => {
        onPlayerAction(game.players.get(socket.id), payload);
    });
}

function onDisconnection(socket) {
    game.removePlayer(socket.id);
    io.emit(settings.messages.PLAYERS, [...game.players]);
}

function onPlayerAction(player, action) {
    console.log(player, action);

    player.move(action);

    io.emit(settings.messages.PLAYERS, [...game.players]);
}

io.on(settings.messages.CONNECT, onConnection);

http.listen(port, 'localhost', function () {
    console.log("listening on *:" + port);
});
