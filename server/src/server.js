import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { contractRoutes } from './routes/contract.js';
import { flipsRoutes } from './routes/flips.js';
import { gamesRoutes } from './routes/games.js';
import { playersRoutes } from './routes/players.js';

// Load environment variables
dotenv.config();

export default async function (fastify, opts) {
  // Register CORS
  await fastify.register(cors, {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Register routes
  await fastify.register(gamesRoutes);
  await fastify.register(flipsRoutes);
  await fastify.register(playersRoutes);
  await fastify.register(contractRoutes);

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });
}
