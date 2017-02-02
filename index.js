const express = require('express');
const app = express();
const uuid = require('uuid/v4');
const server = require('http').Server(app);
const io = require("socket.io")(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || '/';

const settings = {
    BACKGROUND_COLOR: '#000000',
    GRID_SIZE: 50,
    PLAYER_MOVE_TIMER: 40,
    GAME_LOOP_TIMER: 100,
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
        GAME_STATE: 'game-state',

        PLAYER_ACTION: 'player-action',

        DISCONNECT: 'disconnect',
        CONNECT: 'connection',
    },
};

class GameObject {

    constructor(position) {
        this._id = uuid();
        this._x = position.x;
        this._y = position.y;
    }

    get id() {
        return this._id;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get position() {
        return {
            x: this.x,
            y: this.y,
        }
    }

    set x(newX) {
        this._x = newX;
    }

    set y(newY) {
        this._y = newY;
    }
}

class Fruit extends GameObject {
}
class BodyPart extends GameObject {
}

class Player {

    constructor(id, position) {
        this._id = id;
        this._bodyParts = [];
        this._direction = null;

        this.expandBody(position);
        this.expandBody(position);
        this.expandBody(position);
    }

    get direction() {
        return this._direction;
    }

    set direction(newDirection) {
        this._direction = newDirection;
    }

    get head() {
        return this._bodyParts[0];
    }

    expandBody(position) {
        const newBodyPart = new BodyPart(position);

        this._bodyParts.push(newBodyPart);
    }

    move() {
        const head = this.head;

        if (head.x <= 0 - settings.GRID_SIZE ||
            head.y <= 0 - settings.GRID_SIZE ||
            head.x >= settings.world.WIDTH ||
            head.y >= settings.world.HEIGHT) {
            return;
        }

        const tail = this._bodyParts.pop();

        let newHeadX = head.x,
            newHeadY = head.y;

        if (this._direction === settings.playerActions.directions.UP) {
            newHeadY += -settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.directions.DOWN) {
            newHeadY += settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.directions.LEFT) {
            newHeadX += -settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.directions.RIGHT) {
            newHeadX += settings.GRID_SIZE;
        }

        this._bodyParts.unshift(tail);

        tail.x = newHeadX;
        tail.y = newHeadY;
    }
}

class Game {

    constructor(postGameLoopCallback) {
        this._grid = new Map();
        this._players = new Map();
        this._fruits = new Map();
        this._postGameLoopCallback = postGameLoopCallback;

        this._createFruit();

        this._startGameLoop();
    }

    get players() {
        return this._players;
    }

    get fruits() {
        return this._fruits;
    }

    _occupySquare(key, gameObject) {
        this._grid.set(key, gameObject);
    }

    _createFruit() {
        const position = {
            x: this.getRandomPosition(settings.world.WIDTH),
            y: this.getRandomPosition(settings.world.HEIGHT),
        };
        const fruit = new Fruit(position);
        this._fruits.set(fruit.id, fruit);

        this._occupySquare(generateGridKey(fruit.position), fruit);
    }

    _movePlayers() {
        for (const player of this._players.values()) {
            player.move();
        }
    }

    _detectCollisions() {
        // Player to fruit collision
        for (const player of this._players.values()) {
            const gridKey = generateGridKey(player.head.position),
                objectOnSquare = this._grid.get(gridKey);

            if (objectOnSquare) {
                this.removeFruit(objectOnSquare.id);
                this._grid.delete(gridKey);
                this._createFruit();
                player.expandBody(player.head.position);
            }
        }
    }

    _startGameLoop() {
        setInterval(() => {
            this._movePlayers();
            this._detectCollisions();

            this._postGameLoopCallback();
        }, settings.GAME_LOOP_TIMER);
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
        const player = new Player(id, position);

        this._players.set(id, player);
    }

    removePlayer(id) {
        this._players.delete(id);
    }

    removeFruit(id) {
        this._fruits.delete(id);
    }
}

function generateGridKey(position) {
    return `${position.x}-${position.y}`;
}

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
    console.log({
        players: [...game.players],
        fruits: [...game.fruits],
    });

    io.emit(settings.messages.GAME_STATE, {
        players: [...game.players],
        fruits: [...game.fruits],
    });
}

io.on(settings.messages.CONNECT, onConnection);

const game = new Game(onGameLoopFinished);

app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

server.listen(PORT);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, PUBLIC_FOLDER, 'index.html'));
});
