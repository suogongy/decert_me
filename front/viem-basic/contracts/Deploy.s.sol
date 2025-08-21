// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {SimpleToken20} from "./SimpleToken.sol";

contract SimpleToken20Script is Script {
    SimpleToken20 public token;

    function setUp() public {}

    function run() public {
        // you should speficify the private key here, pick from the anvil private keys 
        vm.startBroadcast(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d);

        // Deploy token with name "MyToken", symbol "MTK", 18 decimals and 1 million initial supply
        token = new SimpleToken20("MyToken", "MTK", 18, 1_234_000);

        vm.stopBroadcast();
    }
}