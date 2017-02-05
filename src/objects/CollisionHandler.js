const helper = require('../utils/helper');

class CollisionHandler {

    constructor(grid) {
        this._grid = grid;
    }

    playerWithGameObjectCollision(player) {
        const gridKey = helper.generateGridKey(player.head.position),
            objectOnSquare = this._grid.get(gridKey);

        return {
            object: objectOnSquare,
            gridKey: gridKey,
        };
    }
}

module.exports = CollisionHandler;