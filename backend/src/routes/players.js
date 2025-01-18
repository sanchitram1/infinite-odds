import { supabase } from "../config/supabase.js";

export async function playersRoutes(fastify) {
  // Create player
  fastify.post(
    "/player",
    {
      schema: {
        body: {
          type: "object",
          required: ["address"],
          properties: {
            address: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{40}$", // Validates Ethereum address format
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { address } = request.body;

      try {
        // Check if player already exists
        const { data: existingPlayer } = await supabase
          .from("players")
          .select()
          .eq("address", address)
          .single();

        if (existingPlayer) {
          return reply.code(200).send(existingPlayer);
        }

        // Create new player
        const { data, error } = await supabase
          .from("players")
          .insert({ address })
          .select()
          .single();

        if (error) throw error;

        return reply.code(201).send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to create player" });
      }
    }
  );

  // Get player
  fastify.get(
    "/player",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["address"],
          properties: {
            address: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{40}$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { address } = request.query;

      // Verify the request is coming from the player's address
      // In a real implementation, this would verify a signed message or JWT
      // For now, we're just trusting the address parameter

      try {
        const { data, error } = await supabase
          .from("players")
          .select("id, address, created_at")
          .eq("address", address)
          .single();

        if (error) throw error;
        if (!data) {
          return reply.code(404).send({ error: "Player not found" });
        }

        return reply.send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to fetch player" });
      }
    }
  );
}
