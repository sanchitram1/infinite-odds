import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FlipGame, MAX_FLIPS } from '../utils/gameLogic';
import { ethers } from 'ethers';
import { getContract, CONTRACT_ADDRESS } from '../contracts/InfiniteOdds';

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

      // Get contract instance
      const contract = getContract(signer);

      // Stake native TEA
      const tx = await contract.stake({ value: amount });
      console.log('Stake transaction hash:', tx.hash);
      setLastTxHash(tx.hash);
      
      await tx.wait();
      console.log('Stake transaction confirmed!');

      setHasStaked(true);
      startNewGame();
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
        // Game over (bust) - no need to interact with contract
        try {
          setIsLoading(true);
          const gameData = {
            result: 'bust',
            initial_stake: Number(stakeAmount),
            stake: 0,
            num_flips: result.flipNumber,
            flip_history: convertFlipsToString(game.flips)
          };
          
          const { error: supabaseError } = await supabase
            .from('flips')
            .insert([gameData]);
          
          if (supabaseError) throw supabaseError;
        } catch (err) {
          console.error('Error saving game:', err);
          setError('Failed to save game result: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [game, stakeAmount]);

  const handleCashOut = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setLastTxHash(null);
      
      if (!signer) {
        throw new Error('Please connect your wallet first');
      }

      const result = game.cashOut();
      if (!result) return;

      setGameState(game.getGameState());
      
      // TODO: Get signature from backend
      const nonce = Date.now(); // This should come from backend
      const signature = '0x'; // This should come from backend
      const amount = ethers.utils.parseEther(result.finalStake.toString());
      
      // Call contract cashOut
      const contract = getContract(signer);
      const tx = await contract.cashOut(amount, nonce, signature);
      console.log('Cashout transaction hash:', tx.hash);
      setLastTxHash(tx.hash);
      
      await tx.wait();
      console.log('Cashout transaction confirmed!');

      // Save to Supabase
      const gameData = {
        result: 'win',
        initial_stake: Number(stakeAmount),
        stake: result.finalStake,
        num_flips: result.totalFlips,
        flip_history: convertFlipsToString(result.flips)
      };
      
      const { error: supabaseError } = await supabase
        .from('flips')
        .insert([gameData]);
      
      if (supabaseError) throw supabaseError;
      
      setHasStaked(false); // Reset for next game
    } catch (err) {
      console.error('Error cashing out:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [game, signer, stakeAmount]);

  const startNewGame = useCallback(() => {
    console.log('Starting new game');
    const newGame = new FlipGame();
    setGame(newGame);
    setGameState(newGame.getGameState());
    setError(null);
    setHasStaked(false); // Reset staking state when starting a new game
  }, []);

  if (!account) {
    return (
      <div className="game-container">
        <h1>Double or Bust</h1>
        <div className="error">Please connect your wallet to play</div>
      </div>
    );
  }

  if (!hasStaked) {
    return (
      <div className="game-container">
        <h1>Double or Bust</h1>
        <div className="stake-form">
          <label>
            Stake Amount (0-10 TEA):
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={isLoading}
            />
          </label>
          <button onClick={handleStake} disabled={isLoading || !signer}>
            {!signer ? 'Initializing...' : 'Stake & Play'}
          </button>
          {error && <div className="error">{error}</div>}
          {isLoading && <div className="loading">Processing stake...</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>Double or Bust</h1>
      
      <div className="game-stats">
        <p>Current Stake: {gameState.currentStake.toFixed(2)} TEA</p>
        <p>Flips: {gameState.flipCount} / {MAX_FLIPS}</p>
      </div>

      <div className="flip-history">
        {gameState.flips.map((flip, index) => (
          <span key={index} className={`flip-result ${flip}`}>
            {flip === 'heads' ? '2x' : '💥'}
          </span>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="game-controls">
        <button 
          onClick={handleFlip}
          disabled={gameState.isGameOver || gameState.flipCount >= MAX_FLIPS || isLoading}
        >
          Flip Coin
        </button>
        
        <button 
          onClick={handleCashOut}
          disabled={gameState.isGameOver || isLoading}
        >
          Cash Out ({gameState.currentStake.toFixed(2)} TEA)
        </button>

        {gameState.isGameOver && (
          <button onClick={startNewGame} disabled={isLoading}>
            New Game
          </button>
        )}
      </div>

      {isLoading && <div className="loading">Processing transaction...</div>}
      
      {lastTxHash && (
        <div className="transaction-info">
          <p>Last Transaction: <a 
            href={`https://assam.tea.xyz/tx/${lastTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {lastTxHash.slice(0, 6)}...{lastTxHash.slice(-4)}
          </a></p>
        </div>
      )}
    </div>
  );
};

export default Game; 