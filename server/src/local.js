import Fastify from 'fastify';
import serverPlugin from './server.js';

const fastify = Fastify({
  logger: true,
});

// Register our server plugin
fastify.register(serverPlugin);

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