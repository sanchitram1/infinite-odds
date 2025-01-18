const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export async function createPlayer(address) {
  const response = await fetch(`${API_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!response.ok) throw new Error("Failed to create player");
  return response.json();
}

export async function getPlayer(address) {
  const response = await fetch(`${API_URL}/player?address=${address}`);
  if (!response.ok) throw new Error("Failed to get player");
  return response.json();
}

export async function createGame(playerId, stake) {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, stake }),
  });
  if (!response.ok) throw new Error("Failed to create game");
  return response.json();
}

export async function updateGame(gameId, status) {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update game");
  return response.json();
}

export async function recordFlips(gameId, flips) {
  const response = await fetch(`${API_URL}/flips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, flips }),
  });
  if (!response.ok) throw new Error("Failed to record flips");
  return response.json();
}

export async function requestCashOut(gameId, amount) {
  const response = await fetch(`${API_URL}/cashOut`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, amount }),
  });
  if (!response.ok) throw new Error("Failed to process cash out");
  return response.json();
}
