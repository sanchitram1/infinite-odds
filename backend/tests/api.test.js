import { test } from "tap";
import { build } from "../src/app.js";
import { ethers } from "ethers";

// Test data
const TEST_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const TEST_STAKE = "1.0";

test("API endpoints", async (t) => {
  const app = await build();

  await t.test("POST /player - create new player", async (t) => {
    const response = await app.inject({
      method: "POST",
      url: "/player",
      payload: { address: TEST_ADDRESS },
    });
    t.equal(response.statusCode, 201);
    const player = JSON.parse(response.payload);
    t.ok(player.id);
    t.equal(player.address, TEST_ADDRESS);
  });

  await t.test("GET /player - get player info", async (t) => {
    const response = await app.inject({
      method: "GET",
      url: `/player?address=${TEST_ADDRESS}`,
    });
    t.equal(response.statusCode, 200);
    const player = JSON.parse(response.payload);
    t.equal(player.address, TEST_ADDRESS);
  });

  let gameId;
  await t.test("POST /games - create new game", async (t) => {
    const response = await app.inject({
      method: "POST",
      url: "/games",
      payload: {
        playerId: 1, // Assuming first player has ID 1
        stake: TEST_STAKE,
      },
    });
    t.equal(response.statusCode, 201);
    const game = JSON.parse(response.payload);
    t.ok(game.id);
    gameId = game.id;
  });

  await t.test("POST /flips - record flips", async (t) => {
    const response = await app.inject({
      method: "POST",
      url: "/flips",
      payload: {
        gameId,
        flips: ["heads", "tails", "heads"],
      },
    });
    t.equal(response.statusCode, 201);
    const result = JSON.parse(response.payload);
    t.ok(result.success);
  });

  await t.test("PATCH /games/:id - update game status", async (t) => {
    const response = await app.inject({
      method: "PATCH",
      url: `/games/${gameId}`,
      payload: {
        status: "completed",
      },
    });
    t.equal(response.statusCode, 200);
    const game = JSON.parse(response.payload);
    t.equal(game.status, "completed");
  });

  await t.test("POST /cashOut - request cash out", async (t) => {
    const response = await app.inject({
      method: "POST",
      url: "/cashOut",
      payload: {
        gameId,
        amount: ethers.utils.parseEther("2.0").toString(), // Double the stake
      },
    });
    t.equal(response.statusCode, 200);
    const result = JSON.parse(response.payload);
    t.ok(result.txHash);
  });
});

// End-to-end game flow test
test("End-to-end game flow", async (t) => {
  const app = await build();

  // 1. Create player
  const playerResponse = await app.inject({
    method: "POST",
    url: "/player",
    payload: { address: TEST_ADDRESS },
  });
  t.equal(playerResponse.statusCode, 201);
  const player = JSON.parse(playerResponse.payload);

  // 2. Create game
  const gameResponse = await app.inject({
    method: "POST",
    url: "/games",
    payload: {
      playerId: player.id,
      stake: TEST_STAKE,
    },
  });
  t.equal(gameResponse.statusCode, 201);
  const game = JSON.parse(gameResponse.payload);

  // 3. Record flips
  const flipsResponse = await app.inject({
    method: "POST",
    url: "/flips",
    payload: {
      gameId: game.id,
      flips: ["heads", "heads", "tails"],
    },
  });
  t.equal(flipsResponse.statusCode, 201);

  // 4. Update game status
  const updateResponse = await app.inject({
    method: "PATCH",
    url: `/games/${game.id}`,
    payload: {
      status: "completed",
    },
  });
  t.equal(updateResponse.statusCode, 200);

  // 5. Cash out
  const cashOutResponse = await app.inject({
    method: "POST",
    url: "/cashOut",
    payload: {
      gameId: game.id,
      amount: ethers.utils.parseEther("2.0").toString(),
    },
  });
  t.equal(cashOutResponse.statusCode, 200);
});
