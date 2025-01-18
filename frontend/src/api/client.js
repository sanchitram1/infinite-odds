const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export async function createPlayer(address) {
  const response = await fetch(`${API_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    throw new Error("Failed to create player");
  }

  return response.json();
}

export async function createGame(playerId, stake, stakeTxHash) {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      stake,
      result: "in-progress",
      stake_txn_hash: stakeTxHash,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
}

export async function updateGame(gameId, updates) {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update game");
  }

  return response.json();
}

export async function recordFlips(gameId, flips) {
  const response = await fetch(`${API_URL}/flips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_id: gameId,
      flips: flips.map((flip) => ({ flip })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to record flips");
  }

  return response.json();
}

export async function requestCashOut(amount, playerAddress) {
  const response = await fetch(`${API_URL}/cashOut`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      playerAddress,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to process cashout");
  }

  return response.json();
}
