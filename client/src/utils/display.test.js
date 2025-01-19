import { formatTxHash, formatNumber, generateTxHashLink } from './display';

describe('display utilities', () => {
  describe('formatTxHash', () => {
    it('should format transaction hash correctly', () => {
      const hash = '0x1234567890abcdef1234567890abcdef12345678';
      expect(formatTxHash(hash)).toBe('0x1234...5678');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
    });
  });

  describe('generateTxHashLink', () => {
    it('should generate correct transaction link', () => {
      const hash = '0x1234567890abcdef1234567890abcdef12345678';
      expect(generateTxHashLink(hash)).toBe(`https://assam.tea.xyz/tx/${hash}`);
    });
  });
}); 