## NFTMarket V1

This project implements a complete NFT marketplace on Ethereum with the following core contracts:

### Core Contracts

1. **SimpleERC721.sol**: A simplified implementation of the ERC721 Non-Fungible Token Standard

2. **ExtendedERC20.sol**: An extended implementation of the ERC20 Fungible Token Standard with callback support

3. **NFTMarket.sol**: The main marketplace contract for listing, buying, and selling NFTs with ETH or ERC20 tokens

### Key Features

- List NFTs for sale with fixed prices
- Buy NFTs with ETH or ERC20 tokens
- Support for token callback mechanisms
- Comprehensive testing with detailed console logs

### Project Structure

```
src/
├── SimpleERC721.sol       # ERC721 NFT implementation
├── ExtendedERC20.sol      # ERC20 token with callback support
├── NFTMarket.sol          # Main marketplace contract
├── IERC721.sol            # ERC721 interface
├── IExtendedERC20.sol     # Extended ERC20 interface
├── ITokenReceiver.sol     # Token receiver interface
test/
├── NFTMarket.t.sol        # Test suite for all contracts
```

### Test Setup Sequence

The following diagram shows the sequence of operations in the test setup phase:

```mermaid
sequenceDiagram
    participant T as NFTMarketTest
    participant E as ExtendedERC20
    participant N as SimpleERC721
    participant M as NFTMarket
    participant R as TestTokenReceiver
    participant S as Seller
    participant B as Buyer

    T->>E: new ExtendedERC20("TestToken", "TST")
    T->>N: new SimpleERC721("TestNFT", "TNFT")
    T->>M: new NFTMarket()
    T->>R: new TestTokenReceiver(market, token)
    Note over T,R: Contract deployment

    T->>N: mint(S, tokenId)
    Note over T,N: Mint NFT to seller

    T->>E: mint(B, tokenAmount)
    Note over T,E: Mint tokens to buyer

    T->>S: Set up seller
    S->>N: approve(market, tokenId)
    Note over S,N: Approve market to transfer NFT

    T->>B: Set up buyer
    B->>E: approve(market, tokenAmount)
    Note over B,E: Approve market to transfer tokens
```

### TestBuyNFTWithETH Sequence

The following diagram shows the sequence of operations when buying an NFT with ETH:

```mermaid
sequenceDiagram
    participant S as Seller
    participant B as Buyer
    participant M as NFTMarket
    participant N as SimpleERC721

    S->>M: listNFT(tokenAddress, tokenId, price)
    M->>N: transferFrom(S, M, tokenId)
    Note over M,N: NFT transferred to market

    B->>M: buyNFT{value: price}(listingId)
    M->>N: transferFrom(M, B, tokenId)
    Note over M,N: NFT transferred to buyer

    M->>S: Transfer ETH to seller
    Note over M,S: Payment transferred to seller
```

### TestBuyNFTWithToken Sequence

The following diagram shows the sequence of operations when buying an NFT with ERC20 tokens:

```mermaid
sequenceDiagram
    participant S as Seller
    participant B as Buyer
    participant T as TestTokenReceiver
    participant M as NFTMarket
    participant N as SimpleERC721
    participant E as ExtendedERC20

    S->>M: listNFT(tokenAddress, tokenId, price)
    M->>N: transferFrom(S, M, tokenId)
    Note over M,N: NFT transferred to market

    T->>E: mint(T, tokenAmount)
    Note over T,E: Mint tokens for receiver

    T->>E: approve(M, tokenAmount)
    Note over T,M: Approve market to spend tokens

    B->>E: transferWithCallback(T, tokenAmount, listingId)
    E->>T: onTokensReceived(B, amount, data)
    Note over E,T: Token transfer triggers callback

    T->>M: buyNFTWithToken(listingId, tokenAddress, amount)
    M->>N: transferFrom(M, T, tokenId)
    Note over M,N: NFT transferred to receiver

    M->>E: transferFrom(T, S, amount)
    Note over M,E: Payment transferred to seller
```

### TestDelistNFT Sequence

The following diagram shows the sequence of operations when delisting an NFT:

```mermaid
sequenceDiagram
    participant S as Seller
    participant M as NFTMarket
    participant N as SimpleERC721

    S->>M: listNFT(tokenAddress, tokenId, price)
    M->>N: transferFrom(S, M, tokenId)
    Note over M,N: NFT transferred to market

    S->>M: delistNFT(listingId)
    M->>N: transferFrom(M, S, tokenId)
    Note over M,N: NFT transferred back to seller
```

### Documentation

For more information about the Foundry development framework used in this project, visit: https://book.getfoundry.sh/