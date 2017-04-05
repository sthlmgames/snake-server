const settings = require('../utils/settings');
const Action = require('./Action');

class ChangeDirectionAction extends Action {

    constructor(player, direction) {
        super();

        this._player = player;
        this._direction = direction;
    }

    execute() {
        const playerDisallowed = (this._player.direction === settings.playerActions[this._direction.value].disallowed);

        if (playerDisallowed) {
            return;
        }

        this._player.direction = this._direction.value;
    }
}

module.exports = ChangeDirectionAction;
