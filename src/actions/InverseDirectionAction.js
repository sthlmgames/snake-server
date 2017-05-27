const settings = require('../utils/settings');
const Action = require('./Action');
const BodyPart = require('../objects/BodyPart');

class InverseDirectionAction extends Action {

    constructor(player) {
        super();

        this._player = player;
    }

    get id() {
        return settings.playerActionTypes.INVERSE_ACTION;
    }

    get isValid() {
        return true;
    }

    execute() {
        if (!this.isValid) {
            return;
        }

        const bodyParts = this._player.bodyParts;
        const tail = bodyParts[bodyParts.length - 1];
        const tailMinusOne = bodyParts[bodyParts.length - 2];

        if (tail.x === tailMinusOne.x) {
            if (tail.y > tailMinusOne.y) {
                this._player.direction = settings.playerActions.DOWN;
            } else {
                this._player.direction = settings.playerActions.UP;
            }
        } else if (tail.y === tailMinusOne.y) {
            if (tail.x > tailMinusOne.x) {
                this._player.direction = settings.playerActions.RIGHT;
            } else {
                this._player.direction = settings.playerActions.LEFT;
            }
        }

        this._player.bodyParts.reverse();
    }
}

InverseDirectionAction.id = settings.playerActionTypes.INVERSE_ACTION;

module.exports = InverseDirectionAction;
