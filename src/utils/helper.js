const settings = require('./settings');

function getRandomPosition(dimension) {
    const maxValue = dimension - settings.GRID_SIZE,
        randomValue = Math.round(Math.random() * maxValue),
        result = Math.round(randomValue / settings.GRID_SIZE) * settings.GRID_SIZE;

    return result;
}

function generateGridKey(position) {
    return `${position.x}-${position.y}`;
}

const helper = {
    getRandomPosition: getRandomPosition,
    generateGridKey: generateGridKey,
};

module.exports = helper;