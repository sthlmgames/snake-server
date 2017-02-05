const BodyPart = require('./BodyPart');

class Player {

    constructor(game, id, position) {
        this._game = game;
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
        const newBodyPart = new BodyPart(this._game, position);

        this._bodyParts.push(newBodyPart);
    }

    move() {
        const head = this.head;

        if (head.x <= 0 - this._game.settings.GRID_SIZE ||
            head.y <= 0 - this._game.settings.GRID_SIZE ||
            head.x >= this._game.settings.world.WIDTH ||
            head.y >= this._game.settings.world.HEIGHT) {
            return;
        }

        const tail = this._bodyParts.pop();

        let newHeadX = head.x,
            newHeadY = head.y;

        if (this._direction === this._game.settings.playerActions.directions.UP) {
            newHeadY += -this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.DOWN) {
            newHeadY += this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.LEFT) {
            newHeadX += -this._game.settings.GRID_SIZE;
        } else if (this._direction === this._game.settings.playerActions.directions.RIGHT) {
            newHeadX += this._game.settings.GRID_SIZE;
        }

        this._bodyParts.unshift(tail);

        tail.x = newHeadX;
        tail.y = newHeadY;
    }
}

module.exports = Player;