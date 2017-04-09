const settings = require('../utils/settings');
const BodyPart = require('./BodyPart');
const PlayerColor = require('./PlayerColor');

class Player {

    constructor(id, position, color, alive, gridHandler) {
        this._id = id;
        this._color = color;
        this._bodyParts = [];
        this._direction = settings.playerActions.RIGHT.value;
        this._alive = alive;
        this._gridHandler = gridHandler;

        this.expandBody(position);
        this.expandBody({
            x: position.x + settings.GRID_SIZE,
            y: position.y + settings.GRID_SIZE,
        });
        // this.expandBody(position);
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

    set alive(allowed) {
        this._alive = allowed;
    }

    get head() {
        return this._bodyParts[0];
    }

    get headIsAgainstTopBounds() {
        return this.head.y === 0;
    }

    get headIsAgainstBottomBounds() {
        return this.head.y === settings.world.HEIGHT - settings.GRID_SIZE;
    }

    get headIsAgainstLeftBounds() {
        return this.head.x === 0;
    }

    get headIsAgainstRightBounds() {
        return this.head.x === settings.world.WIDTH - settings.GRID_SIZE;
    }

    get serialized() {
        return {
            id: this._id,
            bodyParts: this._bodyParts.map(bodyPart => bodyPart.serialized),
            color: this._color.serialized,
        };
    }

    _handleMoveWithinWorldBounds(nextPosition) {
        if (this._direction === settings.playerActions.UP.value) {
            nextPosition.y += -settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.DOWN.value) {
            nextPosition.y += settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.LEFT.value) {
            nextPosition.x += -settings.GRID_SIZE;
        } else if (this._direction === settings.playerActions.RIGHT.value) {
            nextPosition.x += settings.GRID_SIZE;
        }

        return nextPosition;
    }

    _handleFreeMovement(nextPosition) {
        if (this.headIsAgainstTopBounds && this._direction === settings.playerActions.UP.value) {
            nextPosition.y = settings.world.HEIGHT - settings.GRID_SIZE;
        } else if (this.headIsAgainstBottomBounds && this._direction === settings.playerActions.DOWN.value) {
            nextPosition.y = 0;
        } else if (this.headIsAgainstLeftBounds && this._direction === settings.playerActions.LEFT.value) {
            nextPosition.x = settings.world.WIDTH - settings.GRID_SIZE;
        } else if (this.headIsAgainstRightBounds && this._direction === settings.playerActions.RIGHT.value) {
            nextPosition.x = 0;
        } else {
            nextPosition = this._handleMoveWithinWorldBounds(nextPosition);
        }

        return nextPosition;
    }

    _getNextPosition(head) {
        let nextPosition = {
            x: head.x,
            y: head.y,
        };

        if (settings.mode === settings.modes.FREE_MOVEMENT) {
            nextPosition = this._handleFreeMovement(nextPosition);
        } else if (settings.mode === settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
            nextPosition = this._handleMoveWithinWorldBounds(nextPosition);
        }

        return nextPosition;
    }

    kill() {
        this._alive = false;
        this._bodyParts.forEach(bodyPart => this._gridHandler.removeObjectFromGrid(bodyPart));
    }

    expandBody(position) {
        const newBodyPart = new BodyPart(position);

        this._bodyParts.push(newBodyPart);

        this._gridHandler.occupyGridSquare(newBodyPart);
    }

    move() {
        const tail = this._bodyParts.pop(),
            nextPosition = this._getNextPosition(this.head);

        this._gridHandler.removeObjectFromGrid(tail);

        this._bodyParts.unshift(tail);

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