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
            headIsAgainstTopBounds = head.y === 0,
            headIsAgainstBottomBounds = head.y === settings.world.HEIGHT - settings.GRID_SIZE,
            headIsAgainstLeftBounds = head.x === 0,
            headIsAgainstRightBounds = head.x === settings.world.WIDTH - settings.GRID_SIZE,

            collision =
                headIsAgainstTopBounds && player.direction === settings.playerActions.directions.UP ||
                headIsAgainstBottomBounds && player.direction === settings.playerActions.directions.DOWN ||
                headIsAgainstLeftBounds && player.direction === settings.playerActions.directions.LEFT ||
                headIsAgainstRightBounds && player.direction === settings.playerActions.directions.RIGHT;

            return collision;
    }
}

module.exports = CollisionHandler;