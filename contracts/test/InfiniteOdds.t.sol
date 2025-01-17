// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {InfiniteOdds} from "../src/InfiniteOdds.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InfiniteOddsTest is Test {
    InfiniteOdds public game;
    MockERC20 public teaToken;
    address public feeCollector;
    address public player;
    address public signer;
    uint256 public signerPrivateKey;

    uint256 public constant INITIAL_BALANCE = 1000 ether;

    // Events for testing
    event FeeUpdated(uint256 newFee);
    event PlayerCashedOut(
        address indexed player,
        uint256 amount,
        uint256 feeAmount
    );
    event PlayerStaked(address indexed player, uint256 amount);
    event FeeCollectorUpdated(address indexed newCollector);
    event SignerUpdated(address indexed newSigner);

    function setUp() public {
        // Generate signer key pair
        signerPrivateKey = 0xA11CE;
        signer = vm.addr(signerPrivateKey);

        // Deploy mock token and game contract
        teaToken = new MockERC20("TEA Token", "TEA");
        feeCollector = makeAddr("feeCollector");
        player = makeAddr("player");
        game = new InfiniteOdds(address(teaToken), feeCollector, signer);

        // Setup initial balances
        teaToken.mint(player, INITIAL_BALANCE);
        vm.prank(player);
        teaToken.approve(address(game), type(uint256).max);
    }

    function test_InitialFee() public {
        assertEq(game.fee(), 500);
    }

    function test_SetFee() public {
        vm.expectEmit(true, true, true, true);
        emit FeeUpdated(800);
        game.setFee(800);
        assertEq(game.fee(), 800);
    }

    function test_SetFeeTooHigh() public {
        vm.expectRevert("Fee too high");
        game.setFee(1100);
    }

    function test_SetSigner() public {
        address newSigner = makeAddr("newSigner");
        vm.expectEmit(true, true, true, true);
        emit SignerUpdated(newSigner);
        game.setSigner(newSigner);
        assertEq(game.signer(), newSigner);
    }

    function test_SetSigner_ZeroAddress() public {
        vm.expectRevert("Invalid signer");
        game.setSigner(address(0));
    }

    function test_SetFeeCollector() public {
        address newCollector = makeAddr("newCollector");
        vm.expectEmit(true, true, true, true);
        emit FeeCollectorUpdated(newCollector);
        game.setFeeCollector(newCollector);
        assertEq(game.feeCollector(), newCollector);
    }

    function test_SetFeeCollector_ZeroAddress() public {
        vm.expectRevert("Invalid fee collector");
        game.setFeeCollector(address(0));
    }

    function test_Stake() public {
        uint256 stakeAmount = 100 ether;
        vm.expectEmit(true, true, true, true);
        emit PlayerStaked(player, stakeAmount);

        vm.prank(player);
        game.stake(stakeAmount);

        assertEq(teaToken.balanceOf(address(game)), stakeAmount);
        assertEq(teaToken.balanceOf(player), INITIAL_BALANCE - stakeAmount);
    }

    function test_Stake_ZeroAmount() public {
        vm.prank(player);
        vm.expectRevert("Cannot stake 0");
        game.stake(0);
    }

    function test_CashOut_ValidSignature() public {
        // First stake some tokens
        uint256 stakeAmount = 100 ether;
        vm.startPrank(player);
        game.stake(stakeAmount);
        vm.stopPrank();

        // Mint additional tokens to the game contract to cover winnings
        teaToken.mint(address(game), 1000 ether);

        // Calculate expected amounts
        uint256 winAmount = 200 ether; // Double the stake
        uint256 nonce = 1;

        // Generate signature
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(game)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "CashOut(address player,uint256 amount,uint256 nonce)"
                ),
                player,
                winAmount,
                nonce
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Calculate fee amounts
        uint256 feeAmount = (winAmount * game.fee()) / 10000;
        uint256 playerAmount = winAmount - feeAmount;

        // Expect event emission
        vm.expectEmit(true, true, true, true);
        emit PlayerCashedOut(player, playerAmount, feeAmount);

        // Execute cashout with valid signature
        vm.prank(player);
        game.cashOut(winAmount, nonce, signature);

        // Verify balances
        assertEq(
            teaToken.balanceOf(player),
            INITIAL_BALANCE - stakeAmount + playerAmount
        );
        assertEq(teaToken.balanceOf(feeCollector), feeAmount);
    }

    function test_CashOut_InvalidSignature() public {
        // Mint tokens to the game contract
        teaToken.mint(address(game), 1000 ether);

        uint256 winAmount = 200 ether;
        uint256 nonce = 1;

        // Generate signature for different data
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(game)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "CashOut(address player,uint256 amount,uint256 nonce)"
                ),
                player,
                winAmount + 1, // Different amount
                nonce
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, hash);
        bytes memory invalidSignature = abi.encodePacked(r, s, v);

        vm.prank(player);
        vm.expectRevert("Invalid signature");
        game.cashOut(winAmount, nonce, invalidSignature);
    }

    function test_CashOut_WrongSigner() public {
        // Mint tokens to the game contract
        teaToken.mint(address(game), 1000 ether);

        uint256 winAmount = 200 ether;
        uint256 nonce = 1;
        uint256 wrongPrivateKey = 0xB0B;

        // Generate signature with wrong key
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(game)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "CashOut(address player,uint256 amount,uint256 nonce)"
                ),
                player,
                winAmount,
                nonce
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(player);
        vm.expectRevert("Invalid signature");
        game.cashOut(winAmount, nonce, signature);
    }

    function test_CashOut_ZeroAmount() public {
        vm.prank(player);
        vm.expectRevert("Cannot cash out 0");
        game.cashOut(0, 1, "");
    }

    function test_CashOut_ReuseNonce() public {
        // Mint tokens to the game contract
        teaToken.mint(address(game), 1000 ether);

        uint256 winAmount = 200 ether;
        uint256 nonce = 1;

        // Generate valid signature
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(game)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "CashOut(address player,uint256 amount,uint256 nonce)"
                ),
                player,
                winAmount,
                nonce
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // First cashout should succeed
        vm.prank(player);
        game.cashOut(winAmount, nonce, signature);

        // Second cashout with same nonce should fail
        vm.prank(player);
        vm.expectRevert("Nonce already used");
        game.cashOut(winAmount, nonce, signature);
    }

    function test_CashOut_InsufficientBalance() public {
        uint256 winAmount = 2000 ether; // More than INITIAL_BALANCE
        uint256 nonce = 1;

        // Generate valid signature
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256("InfiniteOdds"),
                keccak256("1"),
                block.chainid,
                address(game)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "CashOut(address player,uint256 amount,uint256 nonce)"
                ),
                player,
                winAmount,
                nonce
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(player);
        vm.expectRevert("Transfer amount exceeds balance");
        game.cashOut(winAmount, nonce, signature);
    }
}
