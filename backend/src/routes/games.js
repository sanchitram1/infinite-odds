import { supabase } from "../config/supabase.js";

export async function gamesRoutes(fastify) {
  // Create game
  fastify.post(
    "/games",
    {
      schema: {
        body: {
          type: "object",
          required: ["player_id", "stake", "result"],
          properties: {
            player_id: { type: "number" },
            stake: { type: "number" },
            result: {
              type: "string",
              enum: ["in-progress", "bust", "cash-out"],
            },
            winnings: { type: "number" },
            stake_txn_hash: { type: "string" },
            cash_out_txn_hash: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { body } = request;
      console.log("***** Creating game with data:", body);

      // Validate winnings for cash-out
      if (body.result === "cash-out" && typeof body.winnings !== "number") {
        return reply.code(400).send({
          error: "Winnings must be provided when result is cash-out",
        });
      }

      try {
        const { data, error } = await supabase
          .from("games")
          .insert(body)
          .select()
          .single();

        if (error) {
          console.error("***** Error creating game:", error);
          throw error;
        }

        console.log("***** Successfully created game:", data);
        return reply.code(201).send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to create game" });
      }
    }
  );

  // Update game
  fastify.patch(
    "/games/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {
            result: {
              type: "string",
              enum: ["in-progress", "bust", "cash-out"],
            },
            winnings: { type: "number" },
            cash_out_txn_hash: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { body } = request;
      console.log("***** Updating game:", { id, updates: body });

      // Validate winnings for cash-out
      if (body.result === "cash-out" && typeof body.winnings !== "number") {
        return reply.code(400).send({
          error: "Winnings must be provided when result is cash-out",
        });
      }

      try {
        const { data, error } = await supabase
          .from("games")
          .update(body)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("***** Error updating game:", error);
          throw error;
        }
        if (!data) {
          console.log("***** Game not found:", id);
          return reply.code(404).send({ error: "Game not found" });
        }

        console.log("***** Successfully updated game:", data);
        return reply.send(data);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to update game" });
      }
    }
  );
}
