class GridSquare {

    constructor(id) {
        this._id = id;
        this._gameObjects = new Map();
    }

    get occupied() {
        return this._gameObjects.size;
    }

    get gameObjects() {
        return this._gameObjects.values();
    }

    addGameObject(gameObject) {
        this._gameObjects.set(gameObject.id, gameObject);
    }

    removeGameObject(gameObject) {
        this._gameObjects.delete(gameObject.id);
    }

}

module.exports = GridSquare;