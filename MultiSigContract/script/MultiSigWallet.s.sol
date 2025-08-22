// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/MultiSigWallet.sol";

contract MultiSigWalletScript is Script {
    MultiSigWallet public multiSigWallet;

    function setUp() public {}

    function run() public {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Define the owners of the multi-sig wallet
        address[] memory owners = new address[](3);
        owners[0] = vm.envAddress("OWNER_1");
        owners[1] = vm.envAddress("OWNER_2");
        owners[2] = vm.envAddress("OWNER_3");
        
        // Number of required confirmations
        uint256 requiredConfirmations = vm.envUint("REQUIRED_CONFIRMATIONS");

        vm.startBroadcast(deployerPrivateKey);

        multiSigWallet = new MultiSigWallet(owners, requiredConfirmations);

        vm.stopBroadcast();
        
        console.log("MultiSigWallet deployed at: ", address(multiSigWallet));
        console.log("Required confirmations: ", requiredConfirmations);
        for (uint256 i = 0; i < owners.length; i++) {
            console.log("Owner %s: %s", i, owners[i]);
        }
    }
}