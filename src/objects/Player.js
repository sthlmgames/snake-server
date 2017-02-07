const BodyPart = require('./BodyPart');

class Player {

    constructor(game, id, position, allowedToMove) {
        this._game = game;
        this._id = id;
        this._bodyParts = [];
        this._direction = null;
        this._allowedToMove = allowedToMove;

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

    _getNextPosition(head) {
        let newHeadX = head.x,
            newHeadY = head.y;

        if (this.headIsAgainstTopBounds && this.direction === this._game.settings.playerActions.directions.UP) {
            newHeadY = this._game.settings.world.HEIGHT - this._game.settings.GRID_SIZE;
        } else if (this.headIsAgainstBottomBounds && this.direction === this._game.settings.playerActions.directions.DOWN) {
            newHeadY = 0;
        } else if (this.headIsAgainstLeftBounds && this.direction === this._game.settings.playerActions.directions.LEFT) {
            newHeadX = this._game.settings.world.WIDTH - this._game.settings.GRID_SIZE;
        } else if (this.headIsAgainstRightBounds && this.direction === this._game.settings.playerActions.directions.RIGHT) {
            newHeadX = 0;
        } else {
            if (this._direction === this._game.settings.playerActions.directions.UP) {
                newHeadY += -this._game.settings.GRID_SIZE;
            } else if (this._direction === this._game.settings.playerActions.directions.DOWN) {
                newHeadY += this._game.settings.GRID_SIZE;
            } else if (this._direction === this._game.settings.playerActions.directions.LEFT) {
                newHeadX += -this._game.settings.GRID_SIZE;
            } else if (this._direction === this._game.settings.playerActions.directions.RIGHT) {
                newHeadX += this._game.settings.GRID_SIZE;
            }
        }

        return {
            x: newHeadX,
            y: newHeadY,
        };
    }

    expandBody(position) {
        const newBodyPart = new BodyPart(this._game, position);

        this._bodyParts.push(newBodyPart);
    }

    move() {
        const tail = this._bodyParts.pop(),
            nextPosition = this._getNextPosition(this.head);

        this._bodyParts.unshift(tail);

        tail.x = nextPosition.x;
        tail.y = nextPosition.y;
    }
}

module.exports = Player;