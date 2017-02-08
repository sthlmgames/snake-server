const BodyPart = require('./BodyPart');

class Player {

    constructor(game, id, position, allowedToMove, gridHandler) {
        this._game = game;
        this._id = id;
        this._bodyParts = [];
        this._direction = null;
        this._allowedToMove = allowedToMove;
        this._gridHandler = gridHandler;

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

    get allowedToMove() {
        return this._allowedToMove;
    }

    set allowedToMove(allowed) {
        this._allowedToMove = allowed;
    }

    get head() {
        return this._bodyParts[0];
    }

    get headIsAgainstTopBounds() {
        return this.head.y === 0;
    }

    get headIsAgainstBottomBounds() {
        return this.head.y === this._game.settings.world.HEIGHT - this._game.settings.GRID_SIZE;
    }

    get headIsAgainstLeftBounds() {
        return this.head.x === 0;
    }

    get headIsAgainstRightBounds() {
        return this.head.x === this._game.settings.world.WIDTH - this._game.settings.GRID_SIZE;
    }

    _handleMoveWithinWorldBounds(nextPosition) {
        if (this._direction === this._game.settings.playerActions.directions.UP) {
            nextPosition.y += -this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.DOWN) {
            nextPosition.y += this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.LEFT) {
            nextPosition.x += -this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.RIGHT) {
            nextPosition.x += this._game.settings.GRID_SIZE;
        }

        return nextPosition;
    }

    _handleFreeMovement(nextPosition) {
        if (this.headIsAgainstTopBounds && this.direction === this._game.settings.playerActions.directions.UP) {
            nextPosition.y = this._game.settings.world.HEIGHT - this._game.settings.GRID_SIZE;
        } else if (this.headIsAgainstBottomBounds && this.direction === this._game.settings.playerActions.directions.DOWN) {
            nextPosition.y = 0;
        } else if (this.headIsAgainstLeftBounds && this.direction === this._game.settings.playerActions.directions.LEFT) {
            nextPosition.x = this._game.settings.world.WIDTH - this._game.settings.GRID_SIZE;
        } else if (this.headIsAgainstRightBounds && this.direction === this._game.settings.playerActions.directions.RIGHT) {
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

        if (this._game.settings.mode === this._game.settings.modes.FREE_MOVEMENT) {
            nextPosition = this._handleFreeMovement(nextPosition);
        } else if (this._game.settings.mode === this._game.settings.modes.BLOCKED_BY_WORLD_BOUNDS) {
            nextPosition = this._handleMoveWithinWorldBounds(nextPosition);
        }

        return nextPosition;
    }

    expandBody(position) {
        const newBodyPart = new BodyPart(this._game, position);

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

module.exports = Player;