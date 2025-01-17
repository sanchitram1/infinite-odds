// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {InfiniteOdds} from "../src/InfiniteOdds.sol";

contract DeployInfiniteOdds is Script {
    function run() external returns (InfiniteOdds) {
        // Load private key and addresses from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 signerPrivateKey = vm.envUint("SIGNER_PRIVATE_KEY");
        address feeCollector = vm.envAddress("FEE_COLLECTOR_ADDRESS");

        // Derive signer address from private key
        address signer = vm.addr(signerPrivateKey);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        InfiniteOdds infiniteOdds = new InfiniteOdds(feeCollector, signer);

        vm.stopBroadcast();

        return infiniteOdds;
    }
}
