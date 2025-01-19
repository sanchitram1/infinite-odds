// Game constants from environment
export const MAX_FLIPS = parseInt(process.env.REACT_APP_MAX_FLIPS || '10');
export const MAX_STAKE = parseFloat(process.env.REACT_APP_MAX_STAKE || '10');
export const MIN_STAKE = parseFloat(process.env.REACT_APP_MIN_STAKE || '0.1');
export const INITIAL_STAKE = parseFloat(process.env.REACT_APP_INITIAL_STAKE || '1');

export class FlipGame {
  constructor(stake = INITIAL_STAKE) {
    this.stake = stake;
    this.flips = [];
    this.isGameOver = false;
  }

  flip() {
    if (this.isGameOver || this.flips.length >= MAX_FLIPS) {
      return null;
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    this.flips.push(result);

    if (result === 'heads') {
      this.stake *= 2;
    } else {
      this.isGameOver = true;
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
