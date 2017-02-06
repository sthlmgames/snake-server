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
        const collision =
                player.headIsAgainstTopBounds && player.direction === settings.playerActions.directions.UP ||
                player.headIsAgainstBottomBounds && player.direction === settings.playerActions.directions.DOWN ||
                player.headIsAgainstLeftBounds && player.direction === settings.playerActions.directions.LEFT ||
                player.headIsAgainstRightBounds && player.direction === settings.playerActions.directions.RIGHT;

            return collision;
    }
}

module.exports = CollisionHandler;