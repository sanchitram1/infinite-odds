import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { supabase } from '../supabaseClient'

export default function GameHistory({ account }) {
  const [gameHistory, setGameHistory] = useState([])

  useEffect(() => {
    if (account) {
      loadGameHistory()
    }
  }, [account])

  const loadGameHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('flips')
        .select('*')
        .eq('player_address', account)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setGameHistory(data || [])
    } catch (error) {
      console.error('Error loading game history:', error)
    }
  }

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
                <p>Initial Stake: {game.initial_stake} TEA</p>
                <p>Final Stake: {game.stake} TEA</p>
                <p>Result: {game.result}</p>
                <p>Flips: {game.num_flips}</p>
                <p className="text-sm text-gray-500">History: {game.flip_history}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
} 