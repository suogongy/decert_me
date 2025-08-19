# PPTokenBank Demo Project

## Project Purpose

This is a demonstration project showcasing smart contract development using the Foundry toolkit. The project implements a simple token bank that allows users to deposit and withdraw ERC20 tokens. It demonstrates key concepts such as:

- Smart contract development with Solidity
- Interface-based contract design
- Contract testing with Foundry
- Separation of concerns between token contracts and bank logic

## Project Structure

- `src/`: Contains the main smart contracts
  - `ERC20Token.sol`: A basic ERC20 token implementation
  - `PPTokenBank.sol`: A bank contract for depositing and withdrawing tokens
  - `IERC20Token.sol`: Interface for token operations used by the bank
- `test/`: Contains unit tests for the contracts
- `script/`: Contains deployment scripts

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Foundry](https://getfoundry.sh/)

Install Foundry using the following commands:

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked forge cast anvil
```

## Usage

### Build Contracts

Compile the smart contracts:

```shell
$ forge build
```

### Run Tests

Execute the test suite:

```shell
$ forge test
```

### Format Code

Format the Solidity code according to style guidelines:

```shell
$ forge fmt
```

### Run Local Blockchain

Start a local Ethereum node for testing:

```shell
$ anvil
```

### Deploy Contracts

Deploy contracts to a network:

```shell
$ forge script script/PPTokenBank.s.sol:PPTokenBankScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

## Key Features

- Interface-based design for contract interactions
- Detailed logging for debugging and monitoring
- Comprehensive test coverage
- Modular architecture following Solidity best practices

## Learning Outcomes

This project demonstrates how to:
1. Implement the dependency inversion principle in Solidity
2. Separate contract interfaces from implementations
3. Create comprehensive tests for smart contracts
4. Use Foundry for the complete development lifecycle