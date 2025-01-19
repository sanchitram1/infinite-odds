import { ethers } from 'ethers';

import { contract } from '../config/contract.js';

export async function contractRoutes(fastify) {
  // Stake endpoint
  fastify.post(
    '/stake',
    {
      schema: {
        body: {
          type: 'object',
          required: ['gameId', 'amount'],
          properties: {
            gameId: { type: 'number' },
            amount: { type: 'string' }, // Amount in wei as string
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, amount } = request.body;

      try {
        // Just create the transaction object without gas estimation
        const tx = {
          to: contract.address,
          value: amount,
          data: contract.interface.encodeFunctionData('stake', []),
        };

        return reply.send({ tx });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Failed to process stake',
          details: error.message,
        });
      }
    },
  );

  // Existing cashout endpoint
  fastify.post(
    '/cashOut',
    {
      schema: {
        body: {
          type: 'object',
          required: ['gameId', 'amount', 'playerAddress'],
          properties: {
            gameId: { type: 'number' },
            amount: { type: 'string' }, // Amount in wei as string
            playerAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, amount, playerAddress } = request.body;
      console.log('***** Processing cashout:', {
        gameId,
        amount,
        playerAddress,
      });

      try {
        // Generate nonce
        const nonce = Date.now();

        // Create the message to sign
        const domain = {
          name: 'InfiniteOdds',
          version: '1',
          chainId: await contract.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: contract.address,
        };

        console.log('***** Domain config:', domain);

        const types = {
          CashOut: [
            { name: 'player', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
          ],
        };

        const value = {
          player: playerAddress,
          amount,
          nonce,
        };

        console.log('***** Signing data:', { types, value });

        // Sign the message
        const signature = await contract.signer._signTypedData(domain, types, value);

        console.log('***** Generated signature:', signature);

        // Create the transaction object
        const tx = {
          to: contract.address,
          data: contract.interface.encodeFunctionData('cashOut', [amount, nonce, signature]),
        };

        return reply.send({
          tx,
          signature,
          nonce,
        });
      } catch (error) {
        console.error('***** Cashout error:', error);
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Failed to process cashout',
          details: error.message,
          stack: error.stack,
        });
      }
    },
  );
}
