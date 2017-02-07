const settings = require('../utils/settings');
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

    playerWithWorldBoundsCollision(player) {
        const head = player.head,
            collision =
                (head.x <= 0 ||
                head.y <= 0 ||
                head.x >= settings.world.WIDTH - settings.GRID_SIZE ||
                head.y >= settings.world.HEIGHT - settings.GRID_SIZE);

            return collision;
    }
}

module.exports = CollisionHandler;