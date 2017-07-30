const GameObject = require('./GameObject');

class BodyPart extends GameObject {

    constructor(position, type) {
        super(position);
        this._type = type;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

BodyPart.HEAD = 'head';
BodyPart.BODY = 'body';

module.exports = BodyPart;