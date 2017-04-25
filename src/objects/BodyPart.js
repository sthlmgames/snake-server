const GameObject = require('./GameObject');

class BodyPart extends GameObject {

    constructor(position, type, player) {
        super(position);
        this._type = type;
        this._player = player;
    }

    get type() {
        return this._type;
    }

    get player() {
        return this._player;
    }
}

BodyPart.HEAD = 'head';

module.exports = BodyPart;