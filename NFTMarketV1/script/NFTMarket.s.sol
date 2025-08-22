
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/NFTMarket.sol";
import "../src/ExtendedERC20.sol";
import "../src/SimpleERC721.sol";

contract NFTMarketScript is Script {
    function run() external {
        // 获取部署者私钥（从环境变量或使用默认值）
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        // 开始广播交易
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署NFTMarket合约
        NFTMarket market = new NFTMarket();
        
        // 部署ExtendedERC20合约 (示例: MyToken, MYT)
        ExtendedERC20 token = new ExtendedERC20("MyToken", "MYT");
        
        // 部署SimpleERC721合约 (示例: MyNFT, MNFT)
        SimpleERC721 nft = new SimpleERC721("MyNFT", "MNFT");
        
        // 结束广播
        vm.stopBroadcast();
        
        // 输出部署的合约地址
        console.log("NFTMarket deployed at:", address(market));
        console.log("ExtendedERC20 deployed at:", address(token));
        console.log("SimpleERC721 deployed at:", address(nft));
    }
    
    // 本地测试网络部署
    function deployToLocalhost() external {
        uint256 deployerPrivateKey = vm.envOr("LOCALHOST_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);
        
        NFTMarket market = new NFTMarket();
        ExtendedERC20 token = new ExtendedERC20("MyToken", "MYT");
        SimpleERC721 nft = new SimpleERC721("MyNFT", "MNFT");
        
        vm.stopBroadcast();
        
        console.log("NFTMarket deployed to localhost at:", address(market));
        console.log("ExtendedERC20 deployed to localhost at:", address(token));
        console.log("SimpleERC721 deployed to localhost at:", address(nft));
    }
    
    // Goerli测试网络部署
    function deployToGoerli() external {
        uint256 deployerPrivateKey = vm.envOr("GOERLI_PRIVATE_KEY", uint256(0));
        
        vm.startBroadcast(deployerPrivateKey);
        
        NFTMarket market = new NFTMarket();
        ExtendedERC20 token = new ExtendedERC20("MyToken", "MYT");
        SimpleERC721 nft = new SimpleERC721("MyNFT", "MNFT");
        
        vm.stopBroadcast();
        
        console.log("NFTMarket deployed to Goerli at:", address(market));
        console.log("ExtendedERC20 deployed to Goerli at:", address(token));
        console.log("SimpleERC721 deployed to Goerli at:", address(nft));
    }
}