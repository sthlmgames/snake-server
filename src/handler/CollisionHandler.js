const settings = require('../utils/settings');

class CollisionHandler {

    constructor(gridHandler) {
        this._gridHandler = gridHandler;
    }

    playerWithGameObjectCollision(player) {
        const gridSquare = this._gridHandler.getGridSquare(player.head.position),
            collision = gridSquare.occupied && gridSquare.getOtherGameObjects(player.head);

        return collision;
    }

    playerWithWorldBoundsCollision(player) {
        const collision =
            player.headIsAgainstTopBounds && player.direction === settings.playerActions.UP ||
            player.headIsAgainstBottomBounds && player.direction === settings.playerActions.DOWN ||
            player.headIsAgainstLeftBounds && player.direction === settings.playerActions.LEFT ||
            player.headIsAgainstRightBounds && player.direction === settings.playerActions.RIGHT;

        return collision;
    }
}

module.exports = CollisionHandler;