import { ethers } from "ethers";

// Domain data for EIP-712 signature
const domainData = {
  name: "InfiniteOdds",
  version: "1",
  chainId: 93384, // Assam L2
  verifyingContract: "0xEEd3B477f871c61dfd191d88D846eABDE67AEaa3",
};

// Types for EIP-712 signature
const types = {
  CashOut: [
    { name: "player", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

export async function generateCashoutSignature(player, amount, nonce) {
  const signerPrivateKey = process.env.REACT_APP_SIGNER_PRIVATE_KEY;
  if (!signerPrivateKey) {
    throw new Error("Signer private key not configured");
  }

  const wallet = new ethers.Wallet(signerPrivateKey);

  const value = {
    player,
    amount,
    nonce,
  };

  const signature = await wallet._signTypedData(domainData, types, value);
  return signature;
}
