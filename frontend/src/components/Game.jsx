import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FlipGame, MAX_FLIPS } from '../utils/gameLogic';
import { ethers } from 'ethers';
import { getContract } from '../contracts/InfiniteOdds';
import { generateCashoutSignature } from '../utils/signature';
import { CoinsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import LoadingScreen from './LoadingScreen';
import GameHistory from './GameHistory';

const Game = ({ account, provider }) => {
  const [game, setGame] = useState(() => new FlipGame());
  const [gameState, setGameState] = useState(game.getGameState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('1');
  const [hasStaked, setHasStaked] = useState(false);
  const [signer, setSigner] = useState(null);
  const [lastTxHash, setLastTxHash] = useState(null);

  // Initialize ethers signer
  useEffect(() => {
    if (provider && account) {
      const signer = provider.getSigner();
      setSigner(signer);
    }
  }, [provider, account]);

  // Helper to convert flip array to string
  const convertFlipsToString = (flips) => {
    return flips.map(flip => flip === 'heads' ? 'H' : 'T').join('');
  };

  const handleStake = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setLastTxHash(null);

      if (!account) {
        throw new Error('Please connect your wallet first');
      }

      if (!signer) {
        throw new Error('Initializing... Please try again in a moment.');
      }

      const amount = ethers.utils.parseEther(stakeAmount);
      if (amount.lte(0) || amount.gt(ethers.utils.parseEther('10'))) {
        throw new Error('Stake amount must be between 0 and 10 TEA');
      }

      const contract = getContract(signer);
      const tx = await contract.stake({ value: amount });
      console.log('Stake transaction hash:', tx.hash);
      setLastTxHash(tx.hash);
      
      await tx.wait();
      console.log('Stake transaction confirmed!');

      const newGame = new FlipGame();
      setGame(newGame);
      setGameState(newGame.getGameState());
      setHasStaked(true);
    } catch (err) {
      console.error('Staking error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = useCallback(async () => {
    setError(null);
    console.log('handleFlip called');
    const result = game.flip();
    console.log('Flip result:', result);
    
    if (result) {
      setGameState(game.getGameState());
      console.log('Updated game state:', game.getGameState());
      
      if (result.isGameOver) {
        try {
          setIsLoading(true);
          const gameData = {
            player_address: account,
            result: 'bust',
            initial_stake: Number(stakeAmount),
            stake: 0,
            num_flips: result.flipNumber,
            flip_history: convertFlipsToString(game.flips)
          };
          
          const { error: supabaseError } = await supabase
            .from('flips')
            .insert([gameData]);
          
          if (supabaseError) {
            console.error('Database error:', supabaseError);
            // Don't block the game flow on database error
            setError('Game ended, but there was an error saving the result.');
          }
        } catch (err) {
          console.error('Error saving game:', err);
          // Don't block the game flow on database error
          setError('Game ended, but there was an error saving the result.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [game, stakeAmount, account]);

  const handleCashOut = useCallback(async () => {
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
      const nonce = Date.now();
      const signature = await generateCashoutSignature(account, amount, nonce);
      
      const contract = getContract(signer);
      const tx = await contract.cashOut(amount, nonce, signature);
      console.log('Cashout transaction hash:', tx.hash);
      setLastTxHash(tx.hash);
      
      await tx.wait();
      console.log('Cashout transaction confirmed!');

      // Save to Supabase
      const gameData = {
        player_address: account,
        result: 'win',
        initial_stake: Number(stakeAmount),
        stake: result.finalStake,
        num_flips: result.totalFlips,
        flip_history: convertFlipsToString(result.flips)
      };
      
      const { error: supabaseError } = await supabase
        .from('flips')
        .insert([gameData]);
      
      if (supabaseError) {
        console.error('Database error:', supabaseError);
        // Still allow the game to complete even if database save fails
        setError('Successfully cashed out, but there was an error saving the result. Start a new game to play again.');
      } else {
        setError('Successfully cashed out! Start a new game to play again.');
      }
      
      setHasStaked(false);
    } catch (err) {
      console.error('Error cashing out:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [game, signer, stakeAmount, account]);

  const startNewGame = useCallback(() => {
    console.log('Starting new game');
    setHasStaked(false);
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