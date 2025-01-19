import { ExternalLink } from 'lucide-react';
import React from 'react';

export const formatTxHash = (txHash) => {
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
};

export const formatNumber = (number) => {
  return number.toLocaleString();
};

export const generateTxHashLink = (txHash) => {
  return `https://assam.tea.xyz/tx/${txHash}`;
};

export const TxHashWithLink = ({ txHash }) => {
  return (
    <a 
      href={generateTxHashLink(txHash)} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center hover:text-blue-500 transition-colors"
    >
      {formatTxHash(txHash)}
      <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
};

