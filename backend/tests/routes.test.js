import { jest } from "@jest/globals";
import Fastify from "fastify";
import { gamesRoutes } from "../src/routes/games.js";
import { flipsRoutes } from "../src/routes/flips.js";

describe("Game Routes", () => {
  let fastify;

  beforeEach(() => {
    fastify = Fastify();
    fastify.register(gamesRoutes);
    fastify.register(flipsRoutes);
  });

  afterEach(() => {
    fastify.close();
  });

  describe("POST /games", () => {
    test("successfully creates a game with valid payload", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "in-progress",
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toHaveProperty("id");
    });

    test("fails without required fields", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          stake: 1.0, // missing player_id and result
        },
      });

      expect(response.statusCode).toBe(400);
    });

    test("requires winnings when result is cash-out", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "cash-out", // missing winnings
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toHaveProperty(
        "error",
        "Winnings must be provided when result is cash-out"
      );
    });
  });

  describe("PATCH /games/:id", () => {
    test("updates game from in-progress to bust", async () => {
      // First create a game
      const createResponse = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "in-progress",
        },
      });

      const game = JSON.parse(createResponse.payload);

      // Then update it to bust
      const updateResponse = await fastify.inject({
        method: "PATCH",
        url: `/games/${game.id}`,
        payload: {
          result: "bust",
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(JSON.parse(updateResponse.payload)).toHaveProperty(
        "result",
        "bust"
      );
    });

    test("updates game from in-progress to cash-out with winnings", async () => {
      // First create a game
      const createResponse = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "in-progress",
        },
      });

      const game = JSON.parse(createResponse.payload);

      // Then update it to cash-out
      const updateResponse = await fastify.inject({
        method: "PATCH",
        url: `/games/${game.id}`,
        payload: {
          result: "cash-out",
          winnings: 2.0,
          cash_out_txn_hash: "0x123",
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(JSON.parse(updateResponse.payload)).toMatchObject({
        result: "cash-out",
        winnings: 2.0,
      });
    });

    test("fails to update to cash-out without winnings", async () => {
      // First create a game
      const createResponse = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "in-progress",
        },
      });

      const game = JSON.parse(createResponse.payload);

      // Then try to update it to cash-out without winnings
      const updateResponse = await fastify.inject({
        method: "PATCH",
        url: `/games/${game.id}`,
        payload: {
          result: "cash-out",
        },
      });

      expect(updateResponse.statusCode).toBe(400);
    });
  });

  describe("POST /flips", () => {
    test("successfully creates flips with different array lengths", async () => {
      // First create a game
      const createGameResponse = await fastify.inject({
        method: "POST",
        url: "/games",
        payload: {
          player_id: 1,
          stake: 1.0,
          result: "in-progress",
        },
      });

      const game = JSON.parse(createGameResponse.payload);

      // Test with single flip
      const singleFlipResponse = await fastify.inject({
        method: "POST",
        url: "/flips",
        payload: {
          game_id: game.id,
          flips: [{ flip: "heads" }],
        },
      });

      expect(singleFlipResponse.statusCode).toBe(201);
      expect(JSON.parse(singleFlipResponse.payload)).toHaveLength(1);

      // Test with multiple flips
      const multipleFlipsResponse = await fastify.inject({
        method: "POST",
        url: "/flips",
        payload: {
          game_id: game.id,
          flips: [{ flip: "heads" }, { flip: "tails" }, { flip: "heads" }],
        },
      });

      expect(multipleFlipsResponse.statusCode).toBe(201);
      expect(JSON.parse(multipleFlipsResponse.payload)).toHaveLength(3);
    });

    test("fails with empty flips array", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/flips",
        payload: {
          game_id: 1,
          flips: [],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
