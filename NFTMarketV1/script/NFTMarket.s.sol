// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/NFTMarket.sol";

contract NFTMarketScript is Script {
    function run() external {
        // 获取部署者私钥（从环境变量或使用默认值）
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        // 开始广播交易
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署NFTMarket合约
        NFTMarket market = new NFTMarket();
        
        // 结束广播
        vm.stopBroadcast();
        
        // 输出部署的合约地址
        console.log("NFTMarket deployed at:", address(market));
    }
    
    // 本地测试网络部署
    function deployToLocalhost() external {
        uint256 deployerPrivateKey = vm.envOr("LOCALHOST_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);
        
        NFTMarket market = new NFTMarket();
        
        vm.stopBroadcast();
        
        console.log("NFTMarket deployed to localhost at:", address(market));
    }
    
    // Goerli测试网络部署
    function deployToGoerli() external {
        uint256 deployerPrivateKey = vm.envOr("GOERLI_PRIVATE_KEY", uint256(0));
        
        vm.startBroadcast(deployerPrivateKey);
        
        NFTMarket market = new NFTMarket();
        
        vm.stopBroadcast();
        
        console.log("NFTMarket deployed to Goerli at:", address(market));
    }
}