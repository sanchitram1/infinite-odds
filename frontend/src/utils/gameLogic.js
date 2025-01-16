// Game constants
export const INITIAL_STAKE = 1;
export const MAX_FLIPS = 10;

export class FlipGame {
  constructor(initialStake = INITIAL_STAKE) {
    this.stake = initialStake;
    this.flips = [];
    this.isGameOver = false;
  }

  flip() {
    if (this.isGameOver || this.flips.length >= MAX_FLIPS) {
      return null;
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    this.flips.push(result);

    if (result === "heads") {
      this.stake *= 2; // Double on heads
    } else {
      this.isGameOver = true; // Bust on tails
      this.stake = 0;
    }

    return {
      result,
      stake: this.stake,
      flipNumber: this.flips.length,
      isGameOver: this.isGameOver,
    };
  }

  cashOut() {
    if (this.isGameOver) {
      return null;
    }

    const gameResult = {
      finalStake: this.stake,
      flips: [...this.flips],
      totalFlips: this.flips.length,
    };

    this.isGameOver = true;
    return gameResult;
  }

  getGameState() {
    return {
      currentStake: this.stake,
      flips: [...this.flips],
      flipCount: this.flips.length,
      isGameOver: this.isGameOver,
    };
  }
}
