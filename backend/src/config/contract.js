import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  'function stake() external payable',
  'function cashOut(uint256 amount, uint256 nonce, bytes memory signature) external',
];

if (!process.env.L2_RPC_URL || !process.env.SIGNER_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
  throw new Error('Missing contract configuration in environment variables');
}

if (!process.env.CHAIN_ID) {
  console.warn('Missing CHAIN_ID in environment variables, defaulting to 1337');
}

// Configure provider with network information and ENS disabled
const network = {
  name: 'tea-l2',
  chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 1337,
  ensAddress: null, // Explicitly disable ENS
};

const provider = new ethers.providers.JsonRpcProvider(process.env.L2_RPC_URL, network);
const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

// Add logging to help debug contract interactions
console.log('Contract Configuration:', {
  rpcUrl: process.env.L2_RPC_URL,
  contractAddress,
  chainId: provider.network.chainId,
  signerAddress: signer.address,
});

export const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
