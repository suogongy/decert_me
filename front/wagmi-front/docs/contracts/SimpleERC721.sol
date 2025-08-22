// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./IERC721.sol";

/**
 * @title SimpleERC721
 * @dev A simplified implementation of the ERC721 Non-Fungible Token Standard
 * This contract implements the basic functionality for creating, owning, and transferring NFTs.
 * 
 * Key features:
 * - Minting new NFTs with unique token IDs
 * - Tracking ownership of each token
 * - Transferring tokens between addresses
 * - Approving other addresses to transfer tokens
 * - Setting operator approvals for managing all tokens of an owner
 */
contract SimpleERC721 is IERC721 {
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    // Mapping from owner address to token count
    mapping(address => uint256) private _balances;
    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Name of the NFT collection, e.g. "CryptoPunks" or "Bored Ape Yacht Club"
    string private _name;
    // Symbol of the NFT collection, e.g. "PUNK" or "BAYC"
    string private _symbol;

    /**
     * @dev Constructor to initialize the NFT collection with a name and symbol
     * @param name_ The name of the NFT collection
     * @param symbol_ The symbol of the NFT collection
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        console.log("SimpleERC721: Contract deployed with name %s and symbol %s", name_, symbol_);
    }

    /**
     * @dev Returns the name of the NFT collection
     * @return The name of the collection
     */
    function name() public view returns (string memory) {
        console.log("SimpleERC721: name() called, returning %s", _name);
        return _name;
    }

    /**
     * @dev Returns the symbol of the NFT collection
     * @return The symbol of the collection
     */
    function symbol() public view returns (string memory) {
        console.log("SimpleERC721: symbol() called, returning %s", _symbol);
        return _symbol;
    }

    /**
     * @dev Returns the number of tokens owned by an address
     * @param owner The address to query the balance of
     * @return The number of tokens owned by the address
     */
    function balanceOf(address owner) public view override returns (uint256) {
        console.log("SimpleERC721: balanceOf(%s) called", owner);
        require(owner != address(0), "ERC721: balance query for the zero address");
        uint256 balance = _balances[owner];
        console.log("SimpleERC721: balanceOf(%s) returning %d", owner, balance);
        return balance;
    }

    /**
     * @dev Returns the owner of the token with the specified ID
     * @param tokenId The token ID to query the owner of
     * @return The address of the owner of the token
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        console.log("SimpleERC721: ownerOf(%d) called", tokenId);
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        console.log("SimpleERC721: ownerOf(%d) returning %s", tokenId, owner);
        return owner;
    }

    /**
     * @dev Transfers a token from one address to another
     * @param from The address to transfer the token from
     * @param to The address to transfer the token to
     * @param tokenId The ID of the token to transfer
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        console.log("SimpleERC721: transferFrom() called from %s to %s", from, to);
        console.log("SimpleERC721: transferFrom() called with tokenId %d by caller %s", tokenId, msg.sender);
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        console.log("SimpleERC721: Caller %s is approved or owner, proceeding with transfer", msg.sender);
        _transfer(from, to, tokenId);
    }

    /**
     * @dev Safely transfers a token from one address to another (without additional data)
     * @param from The address to transfer the token from
     * @param to The address to transfer the token to
     * @param tokenId The ID of the token to transfer
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        console.log("SimpleERC721: safeTransferFrom() called from %s to %s ", from, to);
        console.log("SimpleERC721: safeTransferFrom() called with tokenId %d by caller %s",  tokenId, msg.sender);
        _safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev Safely transfers a token from one address to another (with additional data)
     * @param from The address to transfer the token from
     * @param to The address to transfer the token to
     * @param tokenId The ID of the token to transfer
     * @param data Additional data to send with the transfer
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) public override {
        console.log("SimpleERC721: safeTransferFrom() with data called from %s to %s ", from, to);
        console.log("SimpleERC721: safeTransferFrom() with data called with tokenId %d by caller %s", tokenId, msg.sender);

        _safeTransferFrom(from, to, tokenId, data);
    }

    /**
     * @dev Approves an address to transfer a specific token
     * @param to The address to approve
     * @param tokenId The ID of the token to approve
     */
    function approve(address to, uint256 tokenId) public override {
        console.log("SimpleERC721: approve() called by %s for address %s with tokenId %d", msg.sender, to, tokenId);
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "ERC721: approve caller is not owner nor approved for all");
        console.log("SimpleERC721: Approval conditions met, proceeding with approval");
        _approve(to, tokenId);
    }

    /**
     * @dev Gets the approved address for a token
     * @param tokenId The ID of the token to query
     * @return The approved address for the token
     */
    function getApproved(uint256 tokenId) public view override returns (address) {
        console.log("SimpleERC721: getApproved(%d) called", tokenId);
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        address approved = _tokenApprovals[tokenId];
        console.log("SimpleERC721: getApproved(%d) returning %s", tokenId, approved);
        return approved;
    }

    /**
     * @dev Sets or unsets an operator to manage all tokens of the caller
     * @param operator The address to approve or revoke
     * @param approved True if the operator is approved, false to revoke approval
     */
    function setApprovalForAll(address operator, bool approved) public override {
        console.log("SimpleERC721: setApprovalForAll() called by");
        console.logAddress(msg.sender);
        console.log("for operator");
        console.logAddress(operator);
        console.log("approved:");
        console.log(approved ? "true" : "false");
        require(operator != msg.sender, "ERC721: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        console.log("SimpleERC721: Operator approval set");
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Checks if an operator is approved to manage all tokens of an owner
     * @param owner The owner address
     * @param operator The operator address
     * @return True if the operator is approved, false otherwise
     */
    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        console.log("SimpleERC721: isApprovedForAll() called for owner");
        console.logAddress(owner);
        console.log("and operator");
        console.logAddress(operator);
        bool approved = _operatorApprovals[owner][operator];
        console.log("SimpleERC721: isApprovedForAll() returning");
        console.log(approved ? "true" : "false");
        return approved;
    }

    /**
     * @dev Mints a new token and assigns it to an address
     * @param to The address to mint the token to
     * @param tokenId The ID of the token to mint
     */
    function mint(address to, uint256 tokenId) public {
        console.log("SimpleERC721: mint() called by %s to address %s with tokenId %d", msg.sender, to, tokenId);
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        console.log("SimpleERC721: Mint conditions met, proceeding with mint");
        _mint(to, tokenId);
    }

    /**
     * @dev Checks if a token exists
     * @param tokenId The ID of the token to check
     * @return True if the token exists, false otherwise
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        bool exists = _owners[tokenId] != address(0);
        console.log("SimpleERC721: _exists(%d) called, returning %s", tokenId, exists ? "true" : "false");
        return exists;
    }

    /**
     * @dev Internal function to mint a new token
     * @param to The address to mint the token to
     * @param tokenId The ID of the token to mint
     */
    function _mint(address to, uint256 tokenId) internal {
        console.log("SimpleERC721: _mint() internal function minting to %s with tokenId %d", to, tokenId);
        _balances[to] += 1;
        _owners[tokenId] = to;
        console.log("SimpleERC721: Balance of %s after mint: %d", to, _balances[to]);
        emit Transfer(address(0), to, tokenId);
    }

    /**
     * @dev Internal function to transfer a token
     * @param from The address to transfer the token from
     * @param to The address to transfer the token to
     * @param tokenId The ID of the token to transfer
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        console.log("SimpleERC721: _transfer() internal function from %s to %s with tokenId %d", from, to, tokenId);
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals
        console.log("SimpleERC721: Clearing approvals for tokenId %d", tokenId);
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        console.log("SimpleERC721: Balance of sender %s after transfer: %d", from, _balances[from]);
        console.log("SimpleERC721: Balance of receiver %s after transfer: %d", to, _balances[to]);

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Internal function to safely transfer a token (simplified implementation)
     * Note: A full implementation would check if the receiver implements onERC721Received
     * @param from The address to transfer the token from
     * @param to The address to transfer the token to
     * @param tokenId The ID of the token to transfer
     * @param _data Additional data to send with the transfer
     */
    function _safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) internal {
        console.log("SimpleERC721: _safeTransferFrom() internal function from %s to %s with tokenId %d", from, to, tokenId);
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        console.log("SimpleERC721: Caller %s is approved or owner, proceeding with safe transfer", msg.sender);
        _transfer(from, to, tokenId);
        // In a full implementation, we would check if the receiver implements onERC721Received
        // For simplicity, we'll skip that check in this implementation
    }

    /**
     * @dev Checks if an address is approved to transfer a token or is the owner
     * @param spender The address to check
     * @param tokenId The ID of the token to check
     * @return True if the address is approved or is the owner, false otherwise
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        console.log("SimpleERC721: _isApprovedOrOwner() called for spender");
        console.logAddress(spender);
        console.log("with tokenId");
        console.logUint(tokenId);
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        bool isOwner = (spender == owner);
        bool isApproved = (getApproved(tokenId) == spender);
        bool isOperator = isApprovedForAll(owner, spender);
        bool result = (isOwner || isApproved || isOperator);
        console.log("SimpleERC721: _isApprovedOrOwner() result:");
        console.log("- isOwner: %s",isOwner ? "true" : "false");
        console.log("- isApproved: %s",isApproved ? "true" : "false");
        console.log("- isOperator: %s", isOperator ? "true" : "false");
        console.log("- overall: %s",result ? "true" : "false");
        return result;
    }
    
    /**
     * @dev Internal function to approve an address to transfer a token
     * @param to The address to approve
     * @param tokenId The ID of the token to approve
     */
    function _approve(address to, uint256 tokenId) internal {
        console.log("SimpleERC721: _approve() internal function approving %s for tokenId %d", to, tokenId);
        _tokenApprovals[tokenId] = to;
        console.log("SimpleERC721: Approval set for tokenId %d to address %s", tokenId, to);
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
}