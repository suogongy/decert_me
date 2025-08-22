// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/MultiSigWallet.sol";

contract MultiSigWalletDevScript is Script {
    MultiSigWallet public multiSigWallet;

    function setUp() public {}

    function run() public {
        // Default test accounts - in a real deployment you would use vm.env* functions
        address[] memory owners = new address[](3);
        owners[0] = 0x1111111111111111111111111111111111111111;
        owners[1] = 0x2222222222222222222222222222222222222222;
        owners[2] = 0x3333333333333333333333333333333333333333;
        
        uint256 requiredConfirmations = 2;

        vm.startBroadcast();
        
        multiSigWallet = new MultiSigWallet(owners, requiredConfirmations);

        vm.stopBroadcast();
        
        console.log("MultiSigWallet deployed at: ", address(multiSigWallet));
        console.log("Required confirmations: ", requiredConfirmations);
        for (uint256 i = 0; i < owners.length; i++) {
            console.log("Owner %s: %s", i, owners[i]);
        }
    }
}