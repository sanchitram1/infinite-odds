import { supabase } from '../config/supabase.js';

export async function playersRoutes(fastify) {
  // Create player
  fastify.post(
    '/player',
    {
      schema: {
        body: {
          type: 'object',
          required: ['address'],
          properties: {
            address: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$', // Validates Ethereum address format
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { address } = request.body;
      console.log('Attempting to create/fetch player with address:', address);

      try {
        // Check if player already exists
        let { data: existingPlayer, error: fetchError } = await supabase
          .from('players')
          .select()
          .eq('address', address)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Not found error is ok
          console.error('Error checking for existing player:', fetchError);
          throw fetchError;
        }

        if (existingPlayer) {
          console.log('Player already exists:', existingPlayer);
          return reply.code(200).send(existingPlayer);
        }

        // Create new player
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .insert({ address })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new player:', insertError);
          throw insertError;
        }

        console.log('New player created:', newPlayer);
        return reply.code(201).send(newPlayer);
      } catch (error) {
        console.error('Error in player creation:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return reply.code(500).send({
          error: 'Failed to create player',
          details: error.message,
        });
      }
    },
  );

  // Get player
  fastify.get(
    '/player',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['address'],
          properties: {
            address: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { address } = request.query;
      console.log('Fetching player with address:', address);

      try {
        const { data, error } = await supabase
          .from('players')
          .select('id, address, created_at')
          .eq('address', address)
          .single();

        if (error) {
          console.error('Error fetching player:', error);
          throw error;
        }

        if (!data) {
          return reply.code(404).send({ error: 'Player not found' });
        }

        console.log('Player found:', data);
        return reply.send(data);
      } catch (error) {
        console.error('Error in player fetch:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return reply.code(500).send({
          error: 'Failed to fetch player',
          details: error.message,
        });
      }
    },
  );
}
