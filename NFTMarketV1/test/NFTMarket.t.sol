// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ExtendedERC20.sol";
import "../src/SimpleERC721.sol";
import "../src/NFTMarket.sol";

contract TestTokenReceiver is ITokenReceiver {
    NFTMarket public market;
    ExtendedERC20 public token;
    
    constructor(NFTMarket _market, ExtendedERC20 _token) {
        market = _market;
        token = _token;
    }
    
    function onTokensReceived(address sender, address, uint256 amount, bytes calldata data) external override {
        // When tokens are received, try to buy an NFT with them
        uint256 listingId = abi.decode(data, (uint256));
        // Approve the market to spend our tokens
        token.approve(address(market), amount);
        // Buy the NFT with tokens
        market.buyNFTWithToken(listingId, address(token), amount);
    }
}

contract NFTMarketTest is Test {
    ExtendedERC20 public token;
    SimpleERC721 public nft;
    NFTMarket public market;
    TestTokenReceiver public receiver;
    
    address public seller = address(1);
    address public buyer = address(2);
    uint256 public tokenId = 1;
    uint256 public price = 1 ether;
    uint256 public tokenAmount = 100 * 10**18; // 100 tokens with 18 decimals
    
    function setUp() public {
        token = new ExtendedERC20("TestToken", "TST");
        nft = new SimpleERC721("TestNFT", "TNFT");
        market = new NFTMarket();
        receiver = new TestTokenReceiver(market, token);
        
        // Mint NFT to seller
        nft.mint(seller, tokenId);
        
        // Mint tokens to buyer
        token.mint(buyer, tokenAmount);
        
        // Approve market to transfer NFT from seller
        vm.prank(seller);
        nft.approve(address(market), tokenId);
        
        // Approve market to transfer tokens from buyer
        vm.prank(buyer);
        token.approve(address(market), tokenAmount);
    }
    
    function testListNFT() public {
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        (uint256 listedTokenId, address tokenAddress, uint256 listedPrice, address sellerAddr, bool active) = market.listings(0);
        
        assertEq(listedTokenId, tokenId);
        assertEq(tokenAddress, address(nft));
        assertEq(listedPrice, price);
        assertEq(sellerAddr, seller);
        assertTrue(active);
        assertEq(nft.ownerOf(tokenId), address(market));
    }
    
    function testDelistNFT() public {
        // First list an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Then delist it
        vm.prank(seller);
        market.delistNFT(0);
        
        (, , , , bool active) = market.listings(0);
        assertFalse(active);
        assertEq(nft.ownerOf(tokenId), seller);
    }
    
    function testBuyNFTWithETH() public {
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
    }
    
    function testBuyNFTWithToken() public {
        // List an NFT with token price
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, tokenAmount);
        
        // Mint tokens to receiver so it can transfer them to seller
        token.mint(address(receiver), tokenAmount);
        
        // Receiver approves market to transfer tokens
        vm.prank(address(receiver));
        token.approve(address(market), tokenAmount);
        
        // Check initial state
        assertEq(nft.ownerOf(tokenId), address(market));
        assertEq(token.balanceOf(seller), 0);
        assertEq(token.balanceOf(address(receiver)), tokenAmount);
        assertEq(token.balanceOf(buyer), tokenAmount);
        
        // Buyer transfers tokens to receiver, which triggers purchase
        vm.prank(buyer);
        token.transferWithCallback(address(receiver), tokenAmount, abi.encode(uint256(0)));
        
        // Check final state
        // The receiver is the one who actually bought the NFT (through the callback)
        assertEq(nft.ownerOf(tokenId), address(receiver));
        assertEq(token.balanceOf(seller), tokenAmount);
        // Buyer should have 0 tokens now (sent to receiver)
        assertEq(token.balanceOf(buyer), 0);
        // Receiver should still have tokenAmount (it had tokenAmount and sent tokenAmount to seller)
        assertEq(token.balanceOf(address(receiver)), tokenAmount);
    }
    
    function testRevertWhenNotSellerDelistsNFT() public {
        // List an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Try to delist from non-seller account
        vm.expectRevert(abi.encodeWithSignature("NotSeller(address,uint256)", address(this), uint256(0)));
        market.delistNFT(0);
    }
    
    function testRevertWhenBuyNFTWithInsufficientETH() public {
        // List an NFT
        vm.prank(seller);
        market.listNFT(address(nft), tokenId, price);
        
        // Try to buy with insufficient ETH
        vm.deal(buyer, price - 1);
        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPayment(uint256,uint256)", price - 1, price));
        market.buyNFT{value: price - 1}(0);
    }
}