import { ethers } from "ethers";

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  "function stake() external payable",
  "function cashOut(uint256 amount, uint256 nonce, bytes memory signature) external",
];

// Contract address on Assam L2
console.log("Environment variables:", {
  CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
  NODE_ENV: process.env.NODE_ENV,
  ALL_ENV: process.env,
});

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export function getContract(signer) {
  if (!CONTRACT_ADDRESS) {
    console.error("Environment check on error:", {
      CONTRACT_ADDRESS,
      "process.env.REACT_APP_CONTRACT_ADDRESS":
        process.env.REACT_APP_CONTRACT_ADDRESS,
    });
    throw new Error(
      "Contract address not found in environment variables. Please check your .env file."
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ERC20 ABI - only the functions we need
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

export function getTeaTokenContract(tokenAddress, signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}
