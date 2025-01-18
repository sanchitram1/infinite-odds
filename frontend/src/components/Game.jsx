import React, { useState, useCallback, useEffect } from 'react';
import { FlipGame, MAX_FLIPS, MAX_STAKE, MIN_STAKE } from '../utils/gameLogic';
import { ethers } from 'ethers';
import { CoinsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import LoadingScreen from './LoadingScreen';
import GameHistory from './GameHistory';
import { createPlayer, createGame, updateGame, recordFlips, requestCashOut, requestStake } from '../api/client';

const Game = ({ account, provider }) => {
  const [game, setGame] = useState(() => new FlipGame());
  const [gameState, setGameState] = useState(game.getGameState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('1');
  const [hasStaked, setHasStaked] = useState(false);
  const [signer, setSigner] = useState(null);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  // Initialize ethers signer and create/get player
  useEffect(() => {
    if (provider && account) {
      const signer = provider.getSigner();
      setSigner(signer);
      
      // Create or get player
      createPlayer(account)
        .then(player => setPlayerId(player.id))
        .catch(err => console.error('Error creating/getting player:', err));
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
      if (amount.lte(ethers.utils.parseEther(MIN_STAKE.toString())) || 
          amount.gt(ethers.utils.parseEther(MAX_STAKE.toString()))) {
        throw new Error(`Stake amount must be between ${MIN_STAKE} and ${MAX_STAKE} TEA`);
      }

      // Create game in database first
      const gameData = await createGame(playerId, Number(stakeAmount));
      setCurrentGameId(gameData.id);

      // Get stake transaction from backend
      const { tx } = await requestStake(gameData.id, amount.toString());

      // Execute stake transaction
      const transaction = await signer.sendTransaction(tx);
      setLastTxHash(transaction.hash);
      await transaction.wait();

      // Initialize game state
      const newGame = new FlipGame(Number(stakeAmount));
      setGame(newGame);
      setGameState(newGame.getGameState());
      setHasStaked(true);
    } catch (err) {
      console.error('Staking error:', err);
      setError(err.message);
      // If we created a game but staking failed, update game status
      if (currentGameId) {
        await updateGame(currentGameId, { status: 'failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = useCallback(async () => {
    if (!currentGameId) return;

    setError(null);
    const result = game.flip();
    
    if (result) {
      setGameState(game.getGameState());
      
      try {
        // Record the flip
        await recordFlips(currentGameId, [result.result]);
        
        if (result.isGameOver) {
          // Update game status to bust
          await updateGame(currentGameId, {
            result: 'bust',
            winnings: 0
          });
        }
      } catch (err) {
        console.error('Error recording flip:', err);
        setError('Game state saved locally but there was an error saving to the server.');
      }
    }
  }, [game, currentGameId]);

  const handleCashOut = useCallback(async () => {
    if (!currentGameId) return;

    try {
      setError(null);
      setIsLoading(true);
      setLastTxHash(null);
      
      if (!signer || !account) {
        throw new Error('Please connect your wallet first');
      }

      const result = game.cashOut();
      if (!result) return;

      setGameState(game.getGameState());
      
      const amount = ethers.utils.parseEther(result.finalStake.toString());
      
      // Get cashout data from backend
      const { tx, signature, nonce } = await requestCashOut(currentGameId, amount.toString());
      
      // Execute transaction
      const transaction = await signer.sendTransaction(tx);
      setLastTxHash(transaction.hash);
      await transaction.wait();

      // Update game status
      await updateGame(currentGameId, {
        result: 'cash-out',
        winnings: result.finalStake
      });

      setError('Successfully cashed out! Start a new game to play again.');
      setHasStaked(false);
    } catch (err) {
      console.error('Error cashing out:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [game, signer, account, currentGameId]);

  const startNewGame = useCallback(() => {
    setHasStaked(false);
    setCurrentGameId(null);
  }, []);

  if (isLoading) {
    return <LoadingScreen message={lastTxHash ? `Transaction pending: ${lastTxHash}` : 'Processing...'} />;
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">St. Petersburg Coin Flip</CardTitle>
            <CardDescription className="text-center">Please connect your wallet to play</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">St. Petersburg Coin Flip</CardTitle>
          <CardDescription className="text-center">Flip coins, double your money, but don't lose it all!</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasStaked ? (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter your stake (0-10 TEA)"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                max="10"
                step="0.1"
              />
              <Button 
                onClick={handleStake} 
                disabled={isLoading || !signer} 
                className="w-full"
              >
                {!signer ? 'Initializing...' : 'Start Game'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-center">Current Earnings: {gameState.currentStake.toFixed(2)} TEA</p>
              <p className="text-md text-center">Flip Count: {gameState.flipCount}/{MAX_FLIPS}</p>
              
              <div className="flex justify-center space-x-2 mb-4">
                {gameState.flips.map((flip, index) => (
                  <span key={index} className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${flip === 'heads' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {flip === 'heads' ? '2x' : '💥'}
                  </span>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleFlip}
                  disabled={gameState.isGameOver || gameState.flipCount >= MAX_FLIPS || isLoading}
                  className="flex-1"
                >
                  <CoinsIcon className="mr-2 h-4 w-4" /> Flip Coin
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
          
          {error && (
            <p className="mt-4 text-center font-medium text-sm text-red-500">{error}</p>
          )}
          
          {isLoading && (
            <p className="mt-4 text-center font-medium text-sm text-blue-500">Processing transaction...</p>
          )}
          
          {lastTxHash && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Transaction Hash: {lastTxHash.slice(0, 6)}...{lastTxHash.slice(-4)}
            </p>
          )}
        </CardContent>
      </Card>
      <GameHistory account={account} />
    </div>
  );
};

export default Game; 