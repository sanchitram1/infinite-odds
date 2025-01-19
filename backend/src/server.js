import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';

import { contractRoutes } from './routes/contract.js';
import { flipsRoutes } from './routes/flips.js';
import { gamesRoutes } from './routes/games.js';
import { playersRoutes } from './routes/players.js';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
