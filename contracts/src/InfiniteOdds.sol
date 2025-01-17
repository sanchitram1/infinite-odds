// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title InfiniteOdds
/// @notice A contract for managing double-or-nothing coin flips using native TEA token
contract InfiniteOdds is Ownable, ReentrancyGuard {
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;

    // State variables
    uint256 public fee; // Fee percentage (e.g., 500 = 5%)
    uint256 private constant FEE_DENOMINATOR = 10000;
    address public feeCollector;
    address public signer; // Address that signs valid cashouts

    // Domain Separator for EIP-712
    bytes32 private immutable DOMAIN_SEPARATOR;

    // EIP-712 TypeHash
    bytes32 private constant CASHOUT_TYPEHASH = keccak256("CashOut(address player,uint256 amount,uint256 nonce)");

    // Mapping to prevent replay attacks
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    // Events
    event FeeUpdated(uint256 newFee);
    event PlayerCashedOut(address indexed player, uint256 amount, uint256 feeAmount);
    event PlayerStaked(address indexed player, uint256 amount);
    event FeeCollectorUpdated(address indexed newCollector);
    event SignerUpdated(address indexed newSigner);

    /// @notice Constructor sets initial fee and EIP-712 domain
    /// @param _feeCollector Address to receive fees
    /// @param _signer Address that signs valid cashouts
    constructor(address _feeCollector, address _signer) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_signer != address(0), "Invalid signer");

        feeCollector = _feeCollector;
        signer = _signer;
        fee = 500; // 5% default fee

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Update the signer address
    /// @param newSigner New address that can sign valid cashouts
    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer");
        signer = newSigner;
        emit SignerUpdated(newSigner);
    }

    /// @notice Update the fee collector address
    /// @param newCollector New address to receive fees
    function setFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid fee collector");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }

    /// @notice Update the fee percentage
    /// @param newFee New fee in basis points (e.g., 500 = 5%)
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    /// @notice Stake native TEA to play
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Cannot stake 0");
        emit PlayerStaked(msg.sender, msg.value);
    }

    /// @notice Verify the signature for a cashout
    /// @param player Player address
    /// @param amount Amount to cash out
    /// @param nonce Unique nonce to prevent replay attacks
    /// @param signature Signed message proving win
    function verifySignature(address player, uint256 amount, uint256 nonce, bytes memory signature)
        public
        view
        returns (bool)
    {
        require(!usedNonces[player][nonce], "Nonce already used");

        // Compute the hash of the cashout data
        bytes32 structHash = keccak256(abi.encode(CASHOUT_TYPEHASH, player, amount, nonce));

        // Compute the EIP-712 compliant message hash
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        // Recover the signer and verify it matches our trusted signer
        return hash.recover(signature) == signer;
    }

    /// @notice Cash out winnings with signature verification
    /// @param amount Amount to cash out
    /// @param nonce Unique nonce to prevent replay attacks
    /// @param signature Signed message proving win
    function cashOut(uint256 amount, uint256 nonce, bytes memory signature) external nonReentrant {
        require(amount > 0, "Cannot cash out 0");
        require(verifySignature(msg.sender, amount, nonce, signature), "Invalid signature");

        // Mark nonce as used
        usedNonces[msg.sender][nonce] = true;

        // Calculate fee amount
        uint256 feeAmount = (amount * fee) / FEE_DENOMINATOR;
        uint256 playerAmount = amount - feeAmount;

        // Transfer winnings to player
        (bool success1,) = payable(msg.sender).call{value: playerAmount}("");
        require(success1, "Player transfer failed");

        // Transfer fee to collector
        if (feeAmount > 0) {
            (bool success2,) = payable(feeCollector).call{value: feeAmount}("");
            require(success2, "Fee transfer failed");
        }

        emit PlayerCashedOut(msg.sender, playerAmount, feeAmount);
    }

    // Allow contract to receive native TEA
    receive() external payable {}
}
