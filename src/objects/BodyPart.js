const GameObject = require('./GameObject');

class BodyPart extends GameObject {

    constructor(game, position) {
        super(game, position);
    }
}

module.exports = BodyPart;