import React, { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { FlipGame, MAX_FLIPS } from '../utils/gameLogic';

const Game = () => {
  const [game, setGame] = useState(() => new FlipGame());
  const [gameState, setGameState] = useState(game.getGameState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to convert flip array to string
  const convertFlipsToString = (flips) => {
    return flips.map(flip => flip === 'heads' ? 'H' : 'T').join('');
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
        console.log('Game over detected, preparing to save to Supabase');
        // Save bust result to Supabase
        try {
          setIsLoading(true);
          const gameData = {
            result: 'bust',
            initial_stake: 1,
            stake: 0,
            num_flips: result.flipNumber,
            flip_history: convertFlipsToString(game.flips)
          };
          console.log('Attempting to save data to Supabase:', gameData);
          
          const { data, error: supabaseError } = await supabase
            .from('flips')
            .insert([gameData]);
          
          if (supabaseError) {
            console.error('Supabase insert error:', supabaseError);
            throw supabaseError;
          }
          console.log('Successfully saved to Supabase:', data);
          
        } catch (err) {
          console.error('Error details:', {
            message: err.message,
            hint: err.hint,
            details: err.details,
            code: err.code
          });
          setError('Failed to save game result: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [game]);

  const handleCashOut = useCallback(async () => {
    setError(null);
    console.log('handleCashOut called');
    const result = game.cashOut();
    console.log('Cashout result:', result);
    
    if (result) {
      setGameState(game.getGameState());
      console.log('Updated game state:', game.getGameState());
      
      try {
        setIsLoading(true);
        const gameData = {
          result: 'win',
          initial_stake: 1,
          stake: result.finalStake,
          num_flips: result.totalFlips,
          flip_history: convertFlipsToString(result.flips)
        };
        console.log('Attempting to save win data to Supabase:', gameData);
        
        const { data, error: supabaseError } = await supabase
          .from('flips')
          .insert([gameData]);
        
        if (supabaseError) {
          console.error('Supabase insert error:', supabaseError);
          throw supabaseError;
        }
        console.log('Successfully saved win to Supabase:', data);
        
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          hint: err.hint,
          details: err.details,
          code: err.code
        });
        setError('Failed to save game result: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [game]);

  const startNewGame = useCallback(() => {
    console.log('Starting new game');
    const newGame = new FlipGame();
    setGame(newGame);
    setGameState(newGame.getGameState());
    setError(null);
  }, []);

  return (
    <div className="game-container">
      <h1>Double or Bust</h1>
      
      <div className="game-stats">
        <p>Current Stake: ${gameState.currentStake.toFixed(2)}</p>
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
          Cash Out (${gameState.currentStake.toFixed(2)})
        </button>

        {gameState.isGameOver && (
          <button onClick={startNewGame} disabled={isLoading}>
            New Game
          </button>
        )}
      </div>

      {isLoading && <div className="loading">Saving result...</div>}
    </div>
  );
};

export default Game; 