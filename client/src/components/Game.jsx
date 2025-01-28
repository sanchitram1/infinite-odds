import { ethers } from 'ethers';
import { CoinsIcon } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import {
  createPlayer,
  createGame,
  updateGame,
  recordFlips,
  requestCashOut,
  requestStake,
} from '../api/client';
import { formatNumber, TxHashWithLink } from '../utils/display';
import { FlipGame, MAX_FLIPS, MAX_STAKE, MIN_STAKE, INITIAL_STAKE } from '../utils/gameLogic';
import GameHistory from './GameHistory';
import LoadingScreen from './LoadingScreen';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const CoinFlipAnimation = ({ isPlaying }) => {
  if (!isPlaying) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-64 h-64">
        <DotLottieReact
          src="https://lottie.host/6c67dc3f-6bce-49de-babd-e7d04f5368f7/iwZfZnuOPH.lottie"
          autoplay
          loop={false}
        />
      </div>
    </div>
  );
};

const Game = ({ account, provider }) => {
  const [game, setGame] = useState(() => new FlipGame());
  const [gameState, setGameState] = useState(game.getGameState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(INITIAL_STAKE.toString());
  const [hasStaked, setHasStaked] = useState(false);
  const [signer, setSigner] = useState(null);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Initialize ethers signer and create/get player
  useEffect(() => {
    if (provider && account) {
      const signer = provider.getSigner();
      setSigner(signer);

      // Create or get player
      createPlayer(account)
        .then((player) => setPlayerId(player.id))
        .catch((err) => console.error('Error creating/getting player:', err));
    }
  }, [provider, account]);

  const handleStake = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setLastTxHash(null);

      if (!account) throw new Error('Please connect your wallet first');
      if (!signer) throw new Error('Initializing... Please try again in a moment.');
      if (!playerId) throw new Error('Player setup incomplete. Please try again.');

      const amount = ethers.utils.parseEther(stakeAmount);
      if (
        amount.lte(ethers.utils.parseEther(MIN_STAKE.toString())) ||
        amount.gt(ethers.utils.parseEther(MAX_STAKE.toString()))
      ) {
        throw new Error(`Stake amount must be between ${MIN_STAKE} and ${MAX_STAKE} TEA`);
      }

      // Get stake transaction from backend first
      const { tx } = await requestStake(0, amount.toString()); // Using 0 as temporary gameId

      // Execute stake transaction
      const transaction = await signer.sendTransaction(tx);
      setLastTxHash(transaction.hash);
      await transaction.wait();

      // Only create game in database after successful stake
      const gameData = await createGame(playerId, Number(stakeAmount));
      setCurrentGameId(gameData.id);

      // Initialize game state
      const newGame = new FlipGame(Number(stakeAmount));
      setGame(newGame);
      setGameState(newGame.getGameState());
      setHasStaked(true);
    } catch (err) {
      console.error('Staking error:', err);
      // Show friendly message for transaction rejection
      if (err.code === 'ACTION_REJECTED') {
        setError('Next time, maybe accept the transaction :S');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = async () => {
    try {
      setError(null);
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipping(false);
        game.flip();
        setGameState(game.getGameState());
      }, 2000); // Animation duration
    } catch (err) {
      setError(err.message);
      setIsFlipping(false);
    }
  };

  const handleCashOut = useCallback(async () => {
    if (!currentGameId) return;

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      setLastTxHash(null);

      if (!signer || !account) {
        throw new Error('Please connect your wallet first');
      }

      const result = game.cashOut();
      if (!result) return;

      const amount = ethers.utils.parseEther(result.finalStake.toString());

      // Get cashout data from backend
      const { tx } = await requestCashOut(
        currentGameId,
        amount.toString(),
        account,
      );

      // Execute transaction first
      const transaction = await signer.sendTransaction(tx);
      setLastTxHash(transaction.hash);
      await transaction.wait();

      // Only after successful transaction, update the database
      await recordFlips(currentGameId, game.flips);
      await updateGame(currentGameId, {
        result: 'cash-out',
        winnings: result.finalStake,
      });

      // Update UI state only after everything is complete
      setGameState(game.getGameState());
      setSuccess('Successfully cashed out! Start a new game to play again.');
      setHasStaked(false); // This disables the game controls
    } catch (err) {
      console.error('Error cashing out:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Next time, maybe accept the transaction :S');
      } else {
        setError(err.message);
      }
      // If there's an error, revert the game state
      game.isGameOver = false;
      setGameState({...game.getGameState()});
    } finally {
      setIsLoading(false);
    }
  }, [game, signer, account, currentGameId]);

  const startNewGame = useCallback(() => {
    setHasStaked(false);
    setCurrentGameId(null);
    setError(null);
    setSuccess(null);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        message={lastTxHash ? <>Transaction pending: <TxHashWithLink txHash={lastTxHash} /></> : 'Processing...'}
      />
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">St. Petersburg Coin Flip</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to play
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
      <CoinFlipAnimation isPlaying={isFlipping} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">St. Petersburg Coin Flip</CardTitle>
          <CardDescription className="text-center">
            Flip coins, double your money, but don't lose it all!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasStaked ? (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder={`Enter your stake (${MIN_STAKE}-${MAX_STAKE} TEA)`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isLoading}
                min={MIN_STAKE}
                max={MAX_STAKE}
                step={0.1}
              />
              <Button onClick={handleStake} disabled={isLoading || !signer} className="w-full">
                {!signer ? 'Initializing...' : 'Start Game'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-center">
                Current Earnings: {formatNumber(gameState.currentStake)} TEA
              </p>
              <p className="text-md text-center">
                Flip Count: {gameState.flipCount}/{MAX_FLIPS}
              </p>

              <div className="flex justify-center space-x-2 mb-4">
                {gameState.flips.map((flip, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${flip === 'heads' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {flip === 'heads' ? '2x' : '💥'}
                  </span>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleFlip}
                  disabled={isFlipping || !hasStaked}
                  className="flex-1"
                >
                  {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </Button>
                <Button
                  onClick={handleCashOut}
                  disabled={gameState.isGameOver || isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cash Out
                </Button>
              </div>

              {gameState.isGameOver && (
                <Button onClick={startNewGame} disabled={isLoading} className="w-full">
                  New Game
                </Button>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-center font-medium text-sm text-red-500">{error}</p>}

          {success && <p className="mt-4 text-center font-medium text-sm text-green-500">{success}</p>}

          {isLoading && (
            <p className="mt-4 text-center font-medium text-sm text-blue-500">
              Processing transaction...
            </p>
          )}

          {lastTxHash && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Transaction Hash: <TxHashWithLink txHash={lastTxHash} />
            </p>
          )}
        </CardContent>
      </Card>
      <GameHistory account={account} />
    </div>
  );
};

export default Game;
