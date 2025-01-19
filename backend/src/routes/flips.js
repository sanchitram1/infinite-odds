import { supabase } from '../config/supabase.js';

export async function flipsRoutes(fastify) {
  fastify.post(
    '/flips',
    {
      schema: {
        body: {
          type: 'object',
          required: ['game_id', 'flips'],
          properties: {
            game_id: { type: 'number' },
            flip: {
              type: 'array',
              items: { type: 'string', enum: ['heads', 'tails'] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { game_id, flips } = request.body;
      console.log('***** flips', flips);

      try {
        // Create flip object with game_id and flips array
        const flipsToInsert = {
          game_id,
          flips,
        };
        console.log('***** flipsToInsert', flipsToInsert);

        const { data, error } = await supabase.from('flips').insert(flipsToInsert).select();

        console.log('***** data', data);

        if (error) {
          console.error('Error inserting flips:', error);
          throw error;
        }

        return reply.code(201).send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to create flips' });
      }
    },
  );
}
