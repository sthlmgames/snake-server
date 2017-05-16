class CollisionHandler {

    constructor(gridHandler) {
        this._gridHandler = gridHandler;
    }

    playerWithGameObjectCollision(player) {
        const gridSquare = this._gridHandler.getGridSquare(player.head.position),
            collision = gridSquare && gridSquare.occupied && gridSquare.getOtherGameObjects(player.head);

        return collision;
    }

    playerWithWorldBoundsCollision(player) {
        return player.isOutsideOfBounds;
    }
}

module.exports = CollisionHandler;