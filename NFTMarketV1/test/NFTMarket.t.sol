// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/ExtendedERC20.sol";
import "../src/SimpleERC721.sol";
import "../src/NFTMarket.sol";

contract NFTMarketTest is Test {
    ExtendedERC20 public token;
    SimpleERC721 public nft;
    NFTMarket public market;
    
    address public seller = address(1);
    address public buyer = address(2);
    uint256 public tokenId = 1;
    uint256 public price = 1 ether;
    uint256 public tokenAmount = 100 * 10**18; // 100 tokens with 18 decimals
    
    function setUp() public {
        console.log("NFTMarketTest: Setting up test environment");
        token = new ExtendedERC20("TestToken", "TST");
        nft = new SimpleERC721("TestNFT", "TNFT");
        market = new NFTMarket();
        
        // Mint NFT to seller
        vm.label(seller, "Seller");
        nft.mint(seller, tokenId);
        console.log("NFTMarketTest: Minted NFT %d to seller", tokenId);
        
        // Mint tokens to buyer
        vm.label(buyer, "Buyer");
        token.mint(buyer, tokenAmount);
        console.log("NFTMarketTest: Minted %d tokens to buyer", tokenAmount);
        
        // Approve market to transfer NFT from seller
        vm.prank(seller);
        nft.approve(address(market), tokenId);
        console.log("NFTMarketTest: Approved market to transfer NFT from seller");
        
        // Approve market to transfer tokens from buyer
        vm.prank(buyer);
        token.approve(address(market), tokenAmount);
        console.log("NFTMarketTest: Approved market to transfer tokens from buyer");
        console.log("NFTMarketTest: Test environment setup completed");
    }
    
    function testListNFT() public {
        console.log("NFTMarketTest: Running testListNFT()");
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        (uint256 listedTokenId, address tokenAddress, uint256 listedPrice, address sellerAddr, bool active) = market.listings(0);
        
        assertEq(listedTokenId, tokenId);
        assertEq(tokenAddress, address(nft));
        assertEq(listedPrice, price);
        assertEq(sellerAddr, seller);
        assertTrue(active);
        assertEq(nft.ownerOf(tokenId), address(market));
        console.log("NFTMarketTest: testListNFT() passed");
    }
    
    function testDelistNFT() public {
        console.log("NFTMarketTest: Running testDelistNFT()");
        // First list an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Then delist it
        vm.prank(seller);
        market.delistNFT(0);
        
        (, , , , bool active) = market.listings(0);
        assertFalse(active);
        assertEq(nft.ownerOf(tokenId), seller);
        console.log("NFTMarketTest: testDelistNFT() passed");
    }
    
    function testBuyNFTWithETH() public {
        console.log("NFTMarketTest: Running testBuyNFTWithETH()");
        // List an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Buy it with ETH
        vm.deal(buyer, price);
        vm.prank(buyer);
        market.buyNFT{value: price}(0);
        
        (, , , , bool active) = market.listings(0);
        assertFalse(active);
        assertEq(nft.ownerOf(tokenId), buyer);
        assertEq(seller.balance, price);
        console.log("NFTMarketTest: testBuyNFTWithETH() passed");
    }
    
    function testBuyNFTWithToken() public {
        console.log("NFTMarketTest: Running testBuyNFTWithToken()");
        // List an NFT with token price
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, tokenAmount);
        
        // Check initial state
        assertEq(nft.ownerOf(tokenId), address(market));
        assertEq(token.balanceOf(seller), 0);
        assertEq(token.balanceOf(buyer), tokenAmount);
        
        // Buyer transfers tokens to market, which triggers purchase via callback
        vm.prank(buyer);
        token.transferWithCallback(address(market), tokenAmount, abi.encode(uint256(0)));
        
        // Check final state
        // The buyer is the one who actually bought the NFT (through the callback)
        assertEq(nft.ownerOf(tokenId), buyer);
        assertEq(token.balanceOf(seller), tokenAmount);
        // Buyer should have 0 tokens now (sent to market)
        assertEq(token.balanceOf(buyer), 0);
        console.log("NFTMarketTest: testBuyNFTWithToken() passed");
    }
    
    function testRevertWhenNotSellerDelistsNFT() public {
        console.log("NFTMarketTest: Running testRevertWhenNotSellerDelistsNFT()");
        // List an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Try to delist from non-seller account
        vm.expectRevert(abi.encodeWithSignature("NotSeller(address,uint256)", address(this), uint256(0)));
        market.delistNFT(0);
        console.log("NFTMarketTest: testRevertWhenNotSellerDelistsNFT() passed");
    }
    
    function testRevertWhenBuyNFTWithInsufficientETH() public {
        console.log("NFTMarketTest: Running testRevertWhenBuyNFTWithInsufficientETH()");
        // List an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Try to buy with insufficient ETH
        vm.deal(buyer, price - 1);
        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPayment(uint256,uint256)", price - 1, price));
        market.buyNFT{value: price - 1}(0);
        console.log("NFTMarketTest: testRevertWhenBuyNFTWithInsufficientETH() passed");
    }
}