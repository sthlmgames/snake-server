const settings = require('../utils/settings');
const GridSquare = require('../objects/GridSquare');

class GridHandler {

    constructor() {
        this._grid = new Map();

        this._initializeGrid();
    }

    _initializeGrid() {
        const gridSize = settings.GRID_SIZE;

        for (let x = 0; x <= settings.world.WIDTH; x = x + gridSize) {
            for (let y = 0; y <= settings.world.HEIGHT; y = y + gridSize) {
                const key = this.generateGridKey({
                    x: x,
                    y: y,
                });

                this._grid.set(key, new GridSquare(key));
            }
        }
    }

    getGridSquare(position) {
        const key = this.generateGridKey(position),
            gridSquare = this._grid.get(key);

        return gridSquare;
    }

    occupyGridSquare(gameObject) {
        const gridSquare = this.getGridSquare(gameObject.position);

        gridSquare.addGameObject(gameObject);
    }

    removeObjectFromGrid(gameObject) {
        const gridSquare = this.getGridSquare(gameObject.position);

        gridSquare.removeGameObject(gameObject);
    }

    getRandomGridPosition(dimension) {
        const maxValue = dimension - settings.GRID_SIZE,
            randomValue = Math.round(Math.random() * maxValue),
            result = Math.round(randomValue / settings.GRID_SIZE) * settings.GRID_SIZE;

        return result;
    }

    generateGridKey(position) {
        return `${position.x}-${position.y}`;
    }
}

module.exports = GridHandler;