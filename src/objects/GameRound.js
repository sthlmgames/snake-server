
class GameRound {

    constructor(networkHandler, players) {
        this._networkHandler = networkHandler;
        this._players = players;

        this._networkHandler.emitGameRoundCountdown();
    }

    _initCountdown() {
        const countdownElement = document.querySelector('.countdown');
        let countdownValue = 3;
        let countdownTimer;

        countdownElement.innerHTML = countdownValue;

        countdownTimer = window.setInterval(() => {
            countdownElement.innerHTML = countdownValue;
            countdownValue--;

            if (countdownValue === -1) {
                window.clearInterval(countdownTimer);
            }
        }, 1000);
    }
}

module.exports = GameRound;