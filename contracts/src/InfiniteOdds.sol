// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title InfiniteOdds
/// @notice A contract for managing double-or-nothing coin flips
contract InfiniteOdds is Ownable, ReentrancyGuard {
    // State variables
    uint256 public fee; // Fee percentage (e.g., 500 = 5%)
    uint256 private constant FEE_DENOMINATOR = 10000;

    // Events
    event FeeUpdated(uint256 newFee);
    event PlayerCashedOut(address indexed player, uint256 amount, uint256 feeAmount);

    /// @notice Constructor sets initial fee
    constructor() Ownable(msg.sender) {
        fee = 500; // 5% default fee
    }

    /// @notice Update the fee percentage
    /// @param newFee New fee in basis points (e.g., 500 = 5%)
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    /// @notice Cash out winnings with signature verification
    /// @param player Player address
    /// @param amount Amount to cash out
    /// @param signature Signed message proving win
    function cashOut(
        address player,
        uint256 amount,
        bytes memory signature
    ) external nonReentrant {
        // TODO: Implement signature verification
        // TODO: Implement token transfer
        // TODO: Calculate and transfer fee
        
        emit PlayerCashedOut(player, amount, (amount * fee) / FEE_DENOMINATOR);
    }
}
