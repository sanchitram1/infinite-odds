import { ethers } from "ethers";

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  "function stake() external payable",
  "function cashOut(uint256 amount, uint256 nonce, bytes memory signature) external",
];

// Contract address on Assam L2
export const CONTRACT_ADDRESS = "0xEEd3B477f871c61dfd191d88D846eABDE67AEaa3";

export function getContract(signer) {
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
