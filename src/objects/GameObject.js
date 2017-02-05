const uuid = require('uuid/v4');

class GameObject {

    constructor(game, position) {
        this._game = game;
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

module.exports = GameObject;