// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./IERC721.sol";
import "./IExtendedERC20.sol";
import "./ITokenReceiver.sol";

/**
 * @title NFTMarket
 * @dev A marketplace contract for buying and selling NFTs with ETH or ERC20 tokens.
 * This contract allows users to list their NFTs for sale, delist them, and enables buyers 
 * to purchase listed NFTs either with ETH or ERC20 tokens.
 * 
 * Key features:
 * - List NFTs for sale with a fixed price
 * - Delist NFTs before they are sold
 * - Buy NFTs with ETH
 * - Buy NFTs with ERC20 tokens
 * - Automatic transfer of NFTs and payments
 */
contract NFTMarket is ITokenReceiver {
    /**
     * @dev Structure to represent a listing in the marketplace
     */
    struct Listing {
        uint256 tokenId;        // The ID of the NFT being listed
        address tokenAddress;   // The contract address of the NFT collection
        uint256 price;          // The price of the NFT (in ETH or ERC20 tokens)
        address seller;         // The address of the seller
        bool active;            // Whether the listing is active or not
    }

    // Mapping from listing ID to Listing details
    mapping(uint256 => Listing) public listings;
    // Counter for the next listing ID
    uint256 public nextListingId;

    // Event emitted when an NFT is listed for sale
    event NFTListed(uint256 indexed listingId, address indexed tokenAddress, uint256 indexed tokenId, uint256 price, address seller);
    // Event emitted when an NFT is delisted (removed from sale)
    event NFTDelisted(uint256 indexed listingId);
    // Event emitted when an NFT is purchased
    event NFTPurchased(uint256 indexed listingId, address indexed buyer);

    // Error when trying to interact with a non-existent listing
    error ListingDoesNotExist(uint256 listingId);
    // Error when a non-seller tries to perform seller-only actions
    error NotSeller(address account, uint256 listingId);
    // Error when trying to interact with an inactive listing
    error ListingNotActive(uint256 listingId);
    // Error when insufficient payment is sent for a purchase
    error InsufficientPayment(uint256 sent, uint256 required);

    /**
     * @dev Callback function called by ERC20 tokens when they are transferred to this contract
     * @param sender The address that sent the tokens
     * @param amount The amount of tokens received
     * @param data Additional data (contains listing ID to purchase)
     */
    function onTokensReceived(address sender, address, uint256 amount, bytes calldata data) external override {
        console.log("NFTMarket: onTokensReceived() called by %s with amount %d", sender, amount);
        // When tokens are received, try to buy an NFT with them
        uint256 listingId = abi.decode(data, (uint256));
        console.log("NFTMarket: Decoded listingId: %d", listingId);
        
        // Get the listing details
        Listing storage listing = listings[listingId];
        
        // Check if listing exists and is active
        if (listing.tokenAddress == address(0)) {
            console.log("NFTMarket: Listing %d does not exist", listingId);
            revert ListingDoesNotExist(listingId);
        }
        
        if (!listing.active) {
            console.log("NFTMarket: Listing %d is not active", listingId);
            revert ListingNotActive(listingId);
        }

        // Check if the amount matches the listing price
        if (amount != listing.price) {
            console.log("NFTMarket: Incorrect amount. Provided: %d, Required: %d", amount, listing.price);
            revert InsufficientPayment(amount, listing.price);
        }

        console.log("NFTMarket: All conditions met, proceeding with token purchase");
        listing.active = false;
        
        // Transfer NFT to the token sender (the one who initiated the token transfer)
        console.log("NFTMarket: Transferring NFT to token sender %s", sender);
        IERC721(listing.tokenAddress).transferFrom(address(this), sender, listing.tokenId);
        console.log("NFTMarket: NFT transfer completed");
        
        // Transfer tokens from this contract to seller
        console.log("NFTMarket: Transferring %d tokens from this contract to seller %s", amount, listing.seller);
        IExtendedERC20(msg.sender).transfer(listing.seller, amount);
        console.log("NFTMarket: Token transfer completed");
        
        emit NFTPurchased(listingId, sender);
        console.log("NFTMarket: NFT purchased successfully with tokens");
    }

    /**
     * @dev List an NFT for sale in the marketplace
     * @param tokenAddress The contract address of the NFT collection
     * @param tokenId The ID of the specific NFT to list
     * @param price The price at which to sell the NFT (in ETH or ERC20 tokens)
     * 
     * Requirements:
     * - The caller must be the owner of the NFT
     * - The caller must approve this contract to transfer the NFT
     * 
     * Effects:
     * - Transfers the NFT from the seller to this contract
     * - Creates a new listing with the specified price
     * - Emits an NFTListed event
     */
    function listNFT(address tokenAddress, uint256 tokenId, uint256 price) external {
        console.log("NFTMarket: listNFT() called by %s for token %s:%d", msg.sender, tokenAddress, tokenId);
        console.log("NFTMarket: listNFT()  with price %d", price);
        // Transfer NFT to market contract
        console.log("NFTMarket: Transferring NFT from %s to market contract", msg.sender);
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        console.log("NFTMarket: NFT transfer completed");
        
        // Create listing
        console.log("NFTMarket: Creating listing with ID %d", nextListingId);
        listings[nextListingId] = Listing({
            tokenId: tokenId,
            tokenAddress: tokenAddress,
            price: price,
            seller: msg.sender,
            active: true
        });

        emit NFTListed(nextListingId, tokenAddress, tokenId, price, msg.sender);
        console.log("NFTMarket: Listing created successfully with ID %d", nextListingId);
        nextListingId++;
    }

    /**
     * @dev Remove an NFT from sale (delist it) and return it to the seller
     * @param listingId The ID of the listing to delist
     * 
     * Requirements:
     * - The listing must exist
     * - The caller must be the seller of the listing
     * - The listing must be active
     * 
     * Effects:
     * - Marks the listing as inactive
     * - Transfers the NFT back to the seller
     * - Emits an NFTDelisted event
     */
    function delistNFT(uint256 listingId) external {
        console.log("NFTMarket: delistNFT() called by %s for listing ID %d", msg.sender, listingId);
        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            console.log("NFTMarket: Listing %d does not exist", listingId);
            revert ListingDoesNotExist(listingId);
        }
        
        if (listing.seller != msg.sender) {
            console.log("NFTMarket: Caller %s is not the seller %s", msg.sender, listing.seller);
            revert NotSeller(msg.sender, listingId);
        }
        
        if (!listing.active) {
            console.log("NFTMarket: Listing %d is not active", listingId);
            revert ListingNotActive(listingId);
        }

        console.log("NFTMarket: All conditions met, delisting NFT");
        listing.active = false;
        
        // Transfer NFT back to seller
        console.log("NFTMarket: Transferring NFT back to seller %s", msg.sender);
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        console.log("NFTMarket: NFT transfer completed");
        
        emit NFTDelisted(listingId);
        console.log("NFTMarket: NFT delisted successfully");
    }

    /**
     * @dev Buy an NFT using ETH
     * @param listingId The ID of the listing to purchase
     * 
     * Requirements:
     * - The listing must exist
     * - The listing must be active
     * - Sufficient ETH must be sent with the transaction
     * 
     * Effects:
     * - Marks the listing as inactive
     * - Transfers the NFT to the buyer
     * - Transfers the ETH to the seller
     * - Refunds any excess ETH to the buyer
     * - Emits an NFTPurchased event
     */
    function buyNFT(uint256 listingId) external payable {
        console.log("NFTMarket: buyNFT() called by %s for listing ID %d with %d ETH", msg.sender, listingId, msg.value);
        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            console.log("NFTMarket: Listing %d does not exist", listingId);
            revert ListingDoesNotExist(listingId);
        }
        
        if (!listing.active) {
            console.log("NFTMarket: Listing %d is not active", listingId);
            revert ListingNotActive(listingId);
        }

        if (msg.value < listing.price) {
            console.log("NFTMarket: Insufficient ETH sent. Sent: %d, Required: %d", msg.value, listing.price);
            revert InsufficientPayment(msg.value, listing.price);
        }

        console.log("NFTMarket: All conditions met, proceeding with purchase");
        listing.active = false;
        
        // Transfer NFT to buyer
        console.log("NFTMarket: Transferring NFT to buyer %s", msg.sender);
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        console.log("NFTMarket: NFT transfer completed");
        
        // Transfer ETH to seller
        console.log("NFTMarket: Transferring %d ETH to seller %s", listing.price, listing.seller);
        _safeTransferETH(listing.seller, listing.price);
        console.log("NFTMarket: ETH transfer completed");
        
        // Refund excess ETH to buyer
        if (msg.value > listing.price) {
            uint256 refund = msg.value - listing.price;
            console.log("NFTMarket: Refunding %d ETH to buyer %s", refund, msg.sender);
            _safeTransferETH(msg.sender, refund);
            console.log("NFTMarket: Refund completed");
        }
        
        emit NFTPurchased(listingId, msg.sender);
        console.log("NFTMarket: NFT purchased successfully");
    }

    /**
     * @dev Buy an NFT using an ERC20 token
     * @param listingId The ID of the listing to purchase
     * @param paymentTokenAddress The contract address of the ERC20 token to use for payment
     * @param amount The amount of tokens to pay (must match the listing price)
     * 
     * Requirements:
     * - The listing must exist
     * - The listing must be active
     * - The amount must match the listing price
     * - The buyer must have approved this contract to transfer the payment tokens
     * 
     * Effects:
     * - Marks the listing as inactive
     * - Transfers the NFT to the buyer
     * - Transfers the payment tokens from buyer to seller
     * - Emits an NFTPurchased event
     */
    function buyNFTWithToken(uint256 listingId, address paymentTokenAddress, uint256 amount) external {
        console.log("NFTMarket: buyNFTWithToken() called by %s for listing ID %d with token %s", msg.sender, listingId, paymentTokenAddress);
        console.log("NFTMarket: buyNFTWithToken() called amount %d", amount);

        Listing storage listing = listings[listingId];
        
        if (listing.tokenAddress == address(0)) {
            console.log("NFTMarket: Listing %d does not exist", listingId);
            revert ListingDoesNotExist(listingId);
        }
        
        if (!listing.active) {
            console.log("NFTMarket: Listing %d is not active", listingId);
            revert ListingNotActive(listingId);
        }

        if (amount != listing.price) {
            console.log("NFTMarket: Incorrect amount. Provided: %d, Required: %d", amount, listing.price);
            revert InsufficientPayment(amount, listing.price);
        }

        console.log("NFTMarket: All conditions met, proceeding with token purchase");
        listing.active = false;
        
        // Transfer NFT to buyer (msg.sender)
        console.log("NFTMarket: Transferring NFT to buyer %s", msg.sender);
        IERC721(listing.tokenAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        console.log("NFTMarket: NFT transfer completed");
        
        // Transfer tokens from buyer (msg.sender) to seller
        console.log("NFTMarket: Transferring %d tokens from buyer %s to seller %s", amount, msg.sender, listing.seller);
        IExtendedERC20(paymentTokenAddress).transferFrom(msg.sender, listing.seller, amount);
        console.log("NFTMarket: Token transfer completed");
        
        emit NFTPurchased(listingId, msg.sender);
        console.log("NFTMarket: NFT purchased successfully with tokens");
    }

    /**
     * @dev Internal function to safely transfer ETH to an address
     * @param to The address to transfer ETH to
     * @param amount The amount of ETH to transfer
     */
    function _safeTransferETH(address to, uint256 amount) internal {
        console.log("NFTMarket: _safeTransferETH() transferring %d ETH to %s", amount, to);
        (bool success, ) = payable(to).call{value: amount}("");
        console.log("NFTMarket: ETH transfer result: %s", success ? "success" : "failed");
        require(success, "ETH transfer failed");
    }

    /**
     * @dev Allows the contract to receive ETH
     * This is needed for refunding excess ETH when buying NFTs
     */
    receive() external payable {
        console.log("NFTMarket: Received %d ETH", msg.value);
    }
}