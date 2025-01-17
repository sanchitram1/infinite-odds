// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {InfiniteOdds} from "../src/InfiniteOdds.sol";

contract InfiniteOddsTest is Test {
    InfiniteOdds public game;

    function setUp() public {
        game = new InfiniteOdds();
    }

    function test_InitialFee() public {
        assertEq(game.fee(), 500);
    }

    function test_SetFee() public {
        game.setFee(800);
        assertEq(game.fee(), 800);
    }

    function test_SetFeeTooHigh() public {
        vm.expectRevert("Fee too high");
        game.setFee(1100);
    }
}
