import { supabase } from "../config/supabase.js";

export async function flipsRoutes(fastify) {
  fastify.post(
    "/flips",
    {
      schema: {
        body: {
          type: "object",
          required: ["game_id", "flips"],
          properties: {
            game_id: { type: "number" },
            flips: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["flip"],
                properties: {
                  flip: {
                    type: "string",
                    enum: ["heads", "tails"],
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { game_id, flips } = request.body;

      try {
        // Add game_id to each flip
        const flipsWithGameId = flips.map((flip) => ({
          ...flip,
          game_id,
        }));

        const { data, error } = await supabase
          .from("flips")
          .insert(flipsWithGameId)
          .select();

        if (error) throw error;

        return reply.code(201).send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to create flips" });
      }
    }
  );
}
