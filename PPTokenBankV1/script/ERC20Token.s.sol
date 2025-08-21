// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

contract ERC20TokenScript is Script {
    ERC20Token public token;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy token with name "PPToken", symbol "PPT", 18 decimals and 1 million initial supply
        token = new ERC20Token("PPToken", "PPT", 18, 1_000_000);

        vm.stopBroadcast();
    }
}