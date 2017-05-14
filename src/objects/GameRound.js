const settings = require('../utils/settings');

class GameRound {

    constructor(networkHandler, onCountdownCompletedCallback) {
        this._networkHandler = networkHandler;

        this._networkHandler.emitGameRoundInitiated();
        this._initCountdown(onCountdownCompletedCallback);
    }

    _initCountdown(onCountdownCompletedCallback) {
        let countdownValue = 3;
        let countdownTimer;

        countdownTimer = setInterval(() => {
            this._networkHandler.emitGameRoundCountdown(countdownValue);

            countdownValue--;

            if (countdownValue === -1) {
                clearInterval(countdownTimer);
                onCountdownCompletedCallback();
            }
        }, settings.GAME_ROUND_COUNTDOWN_TIMER);
    }
}

module.exports = GameRound;