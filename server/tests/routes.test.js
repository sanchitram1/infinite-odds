import { jest } from '@jest/globals';
import Fastify from 'fastify';

import { contractRoutes } from '../src/routes/contract.js';
import { flipsRoutes } from '../src/routes/flips.js';
import { gamesRoutes } from '../src/routes/games.js';
import { playersRoutes } from '../src/routes/players.js';

describe('API Routes', () => {
  let fastify;

  beforeEach(() => {
    fastify = Fastify();
    fastify.register(gamesRoutes);
    fastify.register(flipsRoutes);
    fastify.register(playersRoutes);
    fastify.register(contractRoutes);
  });

  afterEach(() => {
    fastify.close();
  });

  describe('Players API', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';

    test('POST /player - creates new player', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/player',
        payload: { address: testAddress },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toHaveProperty('id');
      expect(JSON.parse(response.payload)).toHaveProperty('address', testAddress);
    });

    test('GET /player - retrieves player info', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `/player?address=${testAddress}`,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveProperty('address', testAddress);
    });
  });

  describe('Games API', () => {
    const testGame = {
      player_id: 1,
      stake: 1.0,
      result: 'in-progress',
      stake_txn_hash: '0x123',
    };

    test('POST /games - creates new game', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/games',
        payload: testGame,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toHaveProperty('id');
      expect(JSON.parse(response.payload)).toHaveProperty('result', 'in-progress');
    });

    test('PATCH /games/:id - updates game status', async () => {
      // First create a game
      const createResponse = await fastify.inject({
        method: 'POST',
        url: '/games',
        payload: testGame,
      });

      const game = JSON.parse(createResponse.payload);

      // Then update it
      const updateResponse = await fastify.inject({
        method: 'PATCH',
        url: `/games/${game.id}`,
        payload: {
          result: 'bust',
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(JSON.parse(updateResponse.payload)).toHaveProperty('result', 'bust');
    });
  });

  describe('Flips API', () => {
    test('POST /flips - records flips for a game', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/flips',
        payload: {
          game_id: 1,
          flips: [{ flip: 'heads' }, { flip: 'tails' }],
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toHaveLength(2);
    });
  });

  describe('Contract API', () => {
    const testAmount = '1000000000000000000'; // 1 ETH in wei
    const testAddress = '0x1234567890123456789012345678901234567890';

    test('POST /cashOut - generates signature and processes cashout', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/cashOut',
        payload: {
          amount: testAmount,
          playerAddress: testAddress,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveProperty('signature');
      expect(JSON.parse(response.payload)).toHaveProperty('nonce');
    });
  });
});
