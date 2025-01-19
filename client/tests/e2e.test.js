import { jest } from '@jest/globals';
import Fastify from 'fastify';

import { contractRoutes } from '../src/routes/contract.js';
import { flipsRoutes } from '../src/routes/flips.js';
import { gamesRoutes } from '../src/routes/games.js';
import { playersRoutes } from '../src/routes/players.js';

describe('End-to-End Game Flow', () => {
  let fastify;
  let playerId;
  let gameId;
  const testAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(async () => {
    fastify = Fastify();
    fastify.register(gamesRoutes);
    fastify.register(flipsRoutes);
    fastify.register(playersRoutes);
    fastify.register(contractRoutes);

    // Create a player first
    const playerResponse = await fastify.inject({
      method: 'POST',
      url: '/player',
      payload: { address: testAddress },
    });
    playerId = JSON.parse(playerResponse.payload).id;
  });

  afterEach(() => {
    fastify.close();
  });

  test('Complete game flow: create game → flip coins → cash out', async () => {
    // 1. Create a new game
    const createGameResponse = await fastify.inject({
      method: 'POST',
      url: '/games',
      payload: {
        player_id: playerId,
        stake: 1.0,
        result: 'in-progress',
        stake_txn_hash: '0x123',
      },
    });

    expect(createGameResponse.statusCode).toBe(201);
    gameId = JSON.parse(createGameResponse.payload).id;

    // 2. Record some flips (all heads for testing)
    const flipsResponse = await fastify.inject({
      method: 'POST',
      url: '/flips',
      payload: {
        game_id: gameId,
        flips: [{ flip: 'heads' }, { flip: 'heads' }],
      },
    });

    expect(flipsResponse.statusCode).toBe(201);
    expect(JSON.parse(flipsResponse.payload)).toHaveLength(2);

    // 3. Request cashout signature
    const cashoutResponse = await fastify.inject({
      method: 'POST',
      url: '/cashOut',
      payload: {
        amount: '4000000000000000000', // 4 ETH (1 ETH × 2 × 2)
        playerAddress: testAddress,
      },
    });

    expect(cashoutResponse.statusCode).toBe(200);
    const { signature, nonce } = JSON.parse(cashoutResponse.payload);
    expect(signature).toBeTruthy();
    expect(nonce).toBeTruthy();

    // 4. Update game status to cashed out
    const updateGameResponse = await fastify.inject({
      method: 'PATCH',
      url: `/games/${gameId}`,
      payload: {
        result: 'cash-out',
        winnings: 4.0,
        cash_out_txn_hash: '0x456',
      },
    });

    expect(updateGameResponse.statusCode).toBe(200);
    expect(JSON.parse(updateGameResponse.payload)).toMatchObject({
      result: 'cash-out',
      winnings: 4.0,
    });
  });
});
