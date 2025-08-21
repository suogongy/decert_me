# TokenBank DApp

A decentralized application (DApp) built with React and viem for interacting with the TokenBank smart contract on the Ethereum Sepolia test network.

## Features

- MetaMask wallet integration
- Automatic network switching to Sepolia
- Real-time balance monitoring (ETH, Token, and Deposit balances)
- Token deposit functionality with automatic approval
- Token withdrawal functionality
- Transaction status tracking
- Responsive design for all device sizes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Sepolia test ETH (can be obtained from faucets)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install viem library:
   ```bash
   npm install viem
   ```

## Configuration

Before using the DApp, you need to configure the contract addresses and ABIs:

1. Update the contract addresses in `src/contracts/config.js`:
   ```javascript
   export const CONTRACT_ADDRESSES = {
     sepolia: {
       tokenBank: 'YOUR_TOKEN_BANK_CONTRACT_ADDRESS',
       token: 'YOUR_TOKEN_CONTRACT_ADDRESS'
     }
   };
   ```

2. Add the TokenBank contract ABI to `src/contracts/config.js`:
   ```javascript
   export const TOKEN_BANK_ABI = [
     // Add the actual ABI here
   ];
   ```

3. Add the Token contract ABI to `src/contracts/config.js`:
   ```javascript
   export const TOKEN_ABI = [
     // Add the actual ABI here
   ];
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect your MetaMask wallet

4. Ensure you're on the Sepolia test network

5. Interact with the DApp:
   - View your ETH, Token, and Deposit balances
   - Deposit tokens (requires approval)
   - Withdraw tokens from your deposit

## Development

The main components of the DApp are:

- `src/App.jsx` - Main application component
- `src/contracts/config.js` - Contract addresses and ABIs
- `src/contracts/contractService.js` - Contract interaction service using viem

## Smart Contract Functions

The DApp interacts with two main contracts:

### TokenBank Contract
- `deposit(uint256 amount)` - Deposit tokens to the bank
- `withdraw(uint256 amount)` - Withdraw tokens from the bank
- `balances(address user)` - Get user's deposit balance

### Token Contract
- `approve(address spender, uint256 amount)` - Approve token spending
- `balanceOf(address owner)` - Get token balance

## Error Handling

The DApp includes comprehensive error handling for:
- Wallet connection issues
- Network switching failures
- Transaction errors
- Invalid inputs

## Styling

The DApp uses plain CSS for styling with a responsive design that works on mobile and desktop devices.

## Related Contracts

The TokenBank DApp interacts with two smart contracts deployed on the Sepolia test network:

### 1. ERC20 Token Contract ([ERC20Token.sol](docs/ERC20Token.sol))
This is a standard ERC20 token implementation with the following key features:
- Standard ERC20 functions: transfer, approve, transferFrom
- Balance tracking with mapping
- Allowance management for delegated spending
- Events for transfers and approvals

Key Functions:
- `transfer(address to, uint256 amount)`: Transfer tokens to another address
- `approve(address spender, uint256 amount)`: Approve an address to spend tokens on your behalf
- `transferFrom(address from, address to, uint256 amount)`: Transfer tokens from one address to another (requires approval)
- `balanceOf(address owner)`: Check the token balance of an address

### 2. TokenBank Contract ([PPTokenBank.sol](docs/PPTokenBank.sol))
This is the main banking contract that allows users to deposit and withdraw tokens:
- Deposit functionality that stores tokens in the bank
- Withdrawal functionality that retrieves tokens from the bank
- Balance tracking for each user's deposits
- Events for deposits and withdrawals

Key Functions:
- `deposit(uint256 amount)`: Deposit tokens into the bank
- `withdraw(uint256 amount)`: Withdraw tokens from the bank
- `deposits(address user)`: Check a user's deposit balance in the bank

Both contracts are available in the [docs](docs) directory for reference.