// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ERC20.sol";
import "../src/TokenBank.sol";

contract TokenBankScript is Script {
    ERC20 public token;
    TokenBank public bank;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy the token
        token = new ERC20("Bank Token", "BTK");
        
        // Deploy the bank with the token address
        bank = new TokenBank(address(token));
        

        vm.stopBroadcast();
    }
}