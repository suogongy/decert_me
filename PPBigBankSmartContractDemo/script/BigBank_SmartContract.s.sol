// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Bank,BigBank,Admin} from "../src/BigBank_SmartContract.sol";

contract BigBank_SmartContract_Script is Script {

    function run() public {
        // 获取部署者私钥（测试用）
        uint256 privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(privateKey);

        // 部署 Bank 合约
        Bank bank = new Bank();
        console2.log("Bank deployed to:", address(bank));

        // 部署 BigBank 合约
        BigBank bigBank = new BigBank();
        console2.log("BigBank deployed to:", address(bigBank));

        // 部署 Admin 合约
        Admin admin = new Admin();
        console2.log("Admin deployed to:", address(admin));

        vm.stopBroadcast();
    }
}
