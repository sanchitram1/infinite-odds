import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  "function stake() external payable",
  "function cashOut(uint256 amount, uint256 nonce, bytes memory signature) external",
];

const provider = new ethers.providers.JsonRpcProvider(process.env.L2_RPC_URL);
const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

if (
  !process.env.L2_RPC_URL ||
  !process.env.SIGNER_PRIVATE_KEY ||
  !contractAddress
) {
  throw new Error("Missing contract configuration in environment variables");
}

export const contract = new ethers.Contract(
  contractAddress,
  CONTRACT_ABI,
  signer
);
