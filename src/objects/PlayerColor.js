class PlayerColor {

    constructor(color) {
        this._value = color;
        this._occupied = false;
    }

    get value() {
        return this._value;
    }

    get occupied() {
        return this._occupied;
    }

    set occupied(value) {
        this._occupied = value;
    }
}

module.exports = PlayerColor;
