# MultiSigContract

This project demonstrates a multi-signature wallet implementation using Foundry.

## Overview

A multi-signature wallet is a smart contract that requires multiple parties to confirm transactions before they can be executed. This implementation allows for:

- Configurable number of required confirmations
- Adding and removing owners
- Submitting, confirming, and executing transactions
- Revoking confirmations

## Features

- Secure multi-signature transactions
- Flexible owner management
- Comprehensive test suite
- Deployment scripts

## Contracts

- [MultiSigWallet.sol](src/MultiSigWallet.sol): Main multi-signature wallet contract
- [MultiSigWallet.t.sol](test/MultiSigWallet.t.sol): Test suite for the wallet
- [MultiSigWallet.s.sol](script/MultiSigWallet.s.sol): Deployment script using environment variables
- [MultiSigWalletDev.s.sol](script/MultiSigWalletDev.s.sol): Development deployment script with default values

## Getting Started

### Requirements

- [Foundry](https://getfoundry.sh/)

### Installation

```bash
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Deploy

For development deployment:
```bash
forge script script/MultiSigWalletDev.s.sol:MultiSigWalletDevScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

For production deployment, set environment variables:
```bash
export OWNER_1=0x...
export OWNER_2=0x...
export OWNER_3=0x...
export REQUIRED_CONFIRMATIONS=2
export PRIVATE_KEY=0x...
```

Then run:
```bash
forge script script/MultiSigWallet.s.sol:MultiSigWalletScript --rpc-url <your_rpc_url> --broadcast
```

## Usage

1. Deploy the contract with a list of owners and required confirmations
2. Owners can submit transactions using `submitTransaction`
3. Other owners confirm transactions using `confirmTransaction`
4. Once enough confirmations are received, any owner can execute the transaction using `executeTransaction`
5. Owners can revoke their confirmation using `revokeConfirmation` before execution
6. Owners can be added or removed using `addOwner` and `removeOwner`
7. Required confirmations can be changed using `changeRequiredConfirmations`

## Architecture

The contract is designed with the following components:

- Owner management system
- Transaction submission and confirmation workflow
- Execution mechanism with confirmation requirements
- Owner and confirmation modification functions
- Events for tracking all operations

## Security Considerations

- Only owners can perform operations
- Transactions cannot be executed without sufficient confirmations
- Already executed transactions cannot be executed again
- Owners cannot confirm the same transaction twice
- Only confirmers can revoke their confirmation