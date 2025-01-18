import { contract } from "../config/contract.js";
import { ethers } from "ethers";

export async function contractRoutes(fastify) {
  fastify.post(
    "/cashOut",
    {
      schema: {
        body: {
          type: "object",
          required: ["amount", "playerAddress"],
          properties: {
            amount: { type: "string" }, // Amount in wei as string
            playerAddress: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{40}$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { amount, playerAddress } = request.body;

      try {
        // Generate nonce (using timestamp for simplicity) TODO: secure?
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
          player: playerAddress,
          amount: amount,
          nonce: nonce,
        };

        // Sign the message
        const signature = await contract.signer._signTypedData(
          domain,
          types,
          value
        );

        // Call the contract
        const tx = await contract.cashOut(amount, nonce, signature);

        return reply.send({
          txHash: tx.hash,
          nonce,
          signature,
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
