// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {PPTokenBank} from "../src/PPTokenBank.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

contract PPTokenBankScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // First deploy a token
        ERC20Token token = new ERC20Token("Bank Token", "BTK", 18, 1000000);
        
        // Then deploy the bank with the token
        PPTokenBank bank = new PPTokenBank(address(token));
        
        console2.log("Token deployed at: %s", address(token));
        console2.log("PPTokenBank deployed at: %s", address(bank));
        
        vm.stopBroadcast();
    }
}