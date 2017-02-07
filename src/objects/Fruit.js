const GameObject = require('./GameObject');

class Fruit extends GameObject {

    constructor(game, position) {
        super(game, position);
    }
}

module.exports = Fruit;