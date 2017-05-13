const settings = require('../utils/settings');
const BodyPart = require('./BodyPart');
const PlayerColor = require('./PlayerColor');

class Player {

    constructor(id, position, color, alive, gridHandler) {
        this._id = id;
        this._color = color;
        this._bodyParts = [];
        this._direction = settings.playerActions.RIGHT;
        this._alive = alive;
        this._gridHandler = gridHandler;
        this._score = 0;
        this._ready = false;

        this.expandBody(position, BodyPart.HEAD);
        this.expandBody(position, BodyPart.BODY);
        this.expandBody(position, BodyPart.BODY);
    }

    get id() {
        return this._id;
    }

    get color() {
        return this._color;
    }

    get direction() {
        return this._direction;
    }

    set direction(newDirection) {
        this._direction = newDirection;
    }

    get alive() {
        return this._alive;
    }

    set alive(newValue) {
        this._alive = newValue;
    }

    get head() {
        return this._bodyParts[0];
    }

    get isLeftOfBounds() {
        return this.head.x < 0;
    }

    get isRightOfBounds() {
        return this.head.x > settings.world.WIDTH - settings.GRID_SIZE;
    }

    get isAboveBounds() {
        return this.head.y < 0;
    }

    get isBelowBounds() {
        return this.head.y > settings.world.HEIGHT - settings.GRID_SIZE;
    }

    get isOutsideOfBounds() {
        return this.isLeftOfBounds ||
            this.isRightOfBounds ||
            this.isAboveBounds ||
            this.isBelowBounds;
    }

    get ready() {
        return this._ready;
    }

    set ready(newValue) {
        this._ready = newValue
    }

    get serialized() {
        return {
            id: this._id,
            bodyParts: this._bodyParts.map(bodyPart => bodyPart.serialized),
            color: this._color.serialized,
        };
    }

    _handleWarpThroughWall(nextPosition) {
        if (nextPosition.x < 0) {
            nextPosition.x = settings.world.WIDTH - settings.GRID_SIZE;
        } else if (nextPosition.x > settings.world.WIDTH - settings.GRID_SIZE) {
            nextPosition.x = 0;
        } else if (nextPosition.y < 0) {
            nextPosition.y = settings.world.HEIGHT - settings.GRID_SIZE;
        } else if (nextPosition.y > settings.world.HEIGHT - settings.GRID_SIZE) {
            nextPosition.y = 0;
        }

        return nextPosition;
    }

    _handleMove(nextPosition) {
        if (this._direction.value === settings.playerActions.UP.value) {
            nextPosition.y += -settings.GRID_SIZE;
        } else if (this._direction.value === settings.playerActions.DOWN.value) {
            nextPosition.y += settings.GRID_SIZE;
        } else if (this._direction.value === settings.playerActions.LEFT.value) {
            nextPosition.x += -settings.GRID_SIZE;
        } else if (this._direction.value === settings.playerActions.RIGHT.value) {
            nextPosition.x += settings.GRID_SIZE;
        }

        if (settings.mode === settings.modes.FREE_MOVEMENT) {
            this._handleWarpThroughWall(nextPosition);
        }

        return nextPosition;
    }

    _getNextPosition(head) {
        let nextPosition = {
            x: head.x,
            y: head.y,
        };

        nextPosition = this._handleMove(nextPosition);

        return nextPosition;
    }

    kill() {
        this._alive = false;
        this._bodyParts.forEach(bodyPart => this._gridHandler.removeObjectFromGrid(bodyPart));
    }

    expandBody(position, type) {
        const newBodyPart = new BodyPart(position, type, this);

        this._bodyParts.push(newBodyPart);

        this._gridHandler.occupyGridSquare(newBodyPart);
    }

    move() {
        const tail = this._bodyParts.pop(),
            nextPosition = this._getNextPosition(this.head);

        this._gridHandler.removeObjectFromGrid(tail);

        this.head.type = BodyPart.BODY;

        this._bodyParts.unshift(tail);

        tail.type = BodyPart.HEAD;

        tail.x = nextPosition.x;
        tail.y = nextPosition.y;

        this._gridHandler.occupyGridSquare(tail);
    }
}

Player.colors = [
    new PlayerColor('#FF0000'), // Red
    new PlayerColor('#0000FF'), // Blue
    new PlayerColor('#00FF00'), // Green
    new PlayerColor('#FFFF00'), // Yellow
];

module.exports = Player;