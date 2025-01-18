import { contract } from "../config/contract.js";
import { ethers } from "ethers";

export async function contractRoutes(fastify) {
  // Stake endpoint
  fastify.post(
    "/stake",
    {
      schema: {
        body: {
          type: "object",
          required: ["gameId", "amount"],
          properties: {
            gameId: { type: "number" },
            amount: { type: "string" }, // Amount in wei as string
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, amount } = request.body;

      try {
        // Create the transaction object
        const tx = {
          to: contract.address,
          value: amount,
          data: contract.interface.encodeFunctionData("stake", []),
        };

        // Get gas estimate
        const gasEstimate = await contract.provider.estimateGas(tx);
        tx.gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

        return reply.send({ tx });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Failed to process stake",
          details: error.message,
        });
      }
    }
  );

  // Existing cashout endpoint
  fastify.post(
    "/cashOut",
    {
      schema: {
        body: {
          type: "object",
          required: ["gameId", "amount"],
          properties: {
            gameId: { type: "number" },
            amount: { type: "string" }, // Amount in wei as string
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, amount } = request.body;

      try {
        // Generate nonce
        const nonce = Date.now();

        // Create the message to sign
        const domain = {
          name: "InfiniteOdds",
          version: "1",
          chainId: await contract.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: contract.address,
        };

        const types = {
          CashOut: [
            { name: "player", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        };

        const value = {
          player: request.body.playerAddress,
          amount,
          nonce,
        };

        // Sign the message
        const signature = await contract.signer._signTypedData(
          domain,
          types,
          value
        );

        // Create the transaction object
        const tx = {
          to: contract.address,
          data: contract.interface.encodeFunctionData("cashOut", [
            amount,
            nonce,
            signature,
          ]),
        };

        // Get gas estimate
        const gasEstimate = await contract.provider.estimateGas(tx);
        tx.gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

        return reply.send({
          tx,
          signature,
          nonce,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Failed to process cashout",
          details: error.message,
        });
      }
    }
  );
}
