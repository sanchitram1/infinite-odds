import { useEffect, useState } from 'react';

import { getPlayer } from '../api/client';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function GameHistory({ account }) {
  const [gameHistory, setGameHistory] = useState([]);
  const [playerId, setPlayerId] = useState(null);

  // First get the player ID
  useEffect(() => {
    async function fetchPlayerId() {
      if (!account) return;
      try {
        const player = await getPlayer(account);
        setPlayerId(player.id);
      } catch (error) {
        console.error('Error fetching player:', error);
      }
    }
    fetchPlayerId();
  }, [account]);

  // Then load game history using player ID
  useEffect(() => {
    async function loadGameHistory() {
      if (!playerId) return;

      try {
        // Read-only query to get game history
        const { data, error } = await supabase
          .from('games')
          .select(
            `
            *,
            flips (
              flips
            )
          `,
          )
          .eq('player_id', playerId) // Using numeric player_id
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setGameHistory(data || []);
      } catch (error) {
        console.error('Error loading game history:', error);
      }
    }

    loadGameHistory();
  }, [playerId]); // Depend on playerId instead of account

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Game History</CardTitle>
        <CardDescription>Your recent game results</CardDescription>
      </CardHeader>
      <CardContent>
        {gameHistory.length === 0 ? (
          <p className="text-center text-gray-500">No games played yet</p>
        ) : (
          <ul className="space-y-2">
            {gameHistory.map((game, index) => (
              <li key={index} className="border-b pb-2">
                <p>Initial Stake: {game.stake} TEA</p>
                <p>Final Stake: {game.winnings || 0} TEA</p>
                <p>Result: {game.result}</p>
                <p>Flips: {game.flips?.length || 0}</p>
                <p className="text-sm text-gray-500">
                  History: {game.flips?.map((f) => (f.flip === 'heads' ? 'H' : 'T')).join('')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
