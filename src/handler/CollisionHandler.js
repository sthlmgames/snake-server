const settings = require('../utils/settings');

class CollisionHandler {

    constructor(gridHandler) {
        this._gridHandler = gridHandler;
    }

    playerWithGameObjectCollision(player) {
        const gridSquare = this._gridHandler.getGridSquare(player.head.position),
            collision = gridSquare.occupied && gridSquare.gameObjects;

        return collision;
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