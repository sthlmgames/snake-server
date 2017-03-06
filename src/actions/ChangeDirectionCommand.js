const settings = require('../utils/settings');
const Command = require('./Command');

class ChangeDirectionCommand extends Command {

    constructor(player, direction) {
        super();

        this._player = player;
        this._direction = direction;
    }

    execute() {
        const playerDisallowed = (this._player.direction === settings.playerActions.directions[this._direction].disallowed);

        if (playerDisallowed) {
            return;
        }

        this._player.direction = this._direction;
    }
}

module.exports = ChangeDirectionCommand;
