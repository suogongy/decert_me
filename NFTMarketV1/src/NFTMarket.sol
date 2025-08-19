// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IERC721.sol";
import "./IExtendedERC20.sol";
import "./ITokenReceiver.sol";

contract NFTMarket {
    struct Listing {
        uint256 tokenId;
        address tokenAddress; // This is the NFT contract address
        uint256 price;
        address seller;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    event NFTListed(uint256 indexed listingId, address indexed tokenAddress, uint256 indexed tokenId, uint256 price, address seller);
    event NFTDelisted(uint256 indexed listingId);
    event NFTPurchased(uint256 indexed listingId, address indexed buyer);

    error ListingDoesNotExist(uint256 listingId);
    error NotSeller(address account, uint256 listingId);
    error ListingNotActive(uint256 listingId);
    error InsufficientPayment(uint256 sent, uint256 required);

    function listNFT(address tokenAddress, uint256 tokenId, uint256 price) external {
        // Transfer NFT to market contract
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        
        // Create listing
        listings[nextListingId] = Listing({
            tokenId: tokenId,
            tokenAddress: tokenAddress,
            price: price,
            seller: msg.sender,
            active: true
        });

        emit NFTListed(nextListingId, tokenAddress, tokenId, price, msg.sender);
        nextListingId++;
    }

    function delistNFT(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            revert ListingDoesNotExist(listingId);
        }
        
        if (listing.seller != msg.sender) {
            revert NotSeller(msg.sender, listingId);
        }
        
        if (!listing.active) {
            revert ListingNotActive(listingId);
        }

        listing.active = false;
        
        // Transfer NFT back to seller
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        
        emit NFTDelisted(listingId);
    }

    function buyNFT(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            revert ListingDoesNotExist(listingId);
        }
        
        if (!listing.active) {
            revert ListingNotActive(listingId);
        }

        if (msg.value < listing.price) {
            revert InsufficientPayment(msg.value, listing.price);
        }

        listing.active = false;
        
        // Transfer NFT to buyer
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        
        // Transfer ETH to seller
        _safeTransferETH(listing.seller, listing.price);
        
        // Refund excess ETH to buyer
        if (msg.value > listing.price) {
            _safeTransferETH(msg.sender, msg.value - listing.price);
        }
        
        emit NFTPurchased(listingId, msg.sender);
    }

    function buyNFTWithToken(uint256 listingId, address paymentTokenAddress, uint256 amount) external {
        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            revert ListingDoesNotExist(listingId);
        }
        
        if (!listing.active) {
            revert ListingNotActive(listingId);
        }

        if (amount != listing.price) {
            revert InsufficientPayment(amount, listing.price);
        }

        listing.active = false;
        
        // Transfer NFT to buyer (msg.sender)
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        
        // Transfer tokens from buyer (msg.sender) to seller
        IExtendedERC20(paymentTokenAddress).transferFrom(msg.sender, listing.seller, amount);
        
        emit NFTPurchased(listingId, msg.sender);
    }

    function _safeTransferETH(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    // Allow the contract to receive ETH
    receive() external payable {}
}