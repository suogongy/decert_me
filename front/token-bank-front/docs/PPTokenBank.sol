// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {console2} from "forge-std/console2.sol";

/**
 * @title IERC20Token
 * @dev Interface for ERC20 token operations used by PPTokenBank
 */
interface IERC20Token {
    function transfer(address to, uint256 amount) external returns (bool success);
    function transferFrom(address from, address to, uint256 amount) external returns (bool success);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PPTokenBank
 * @dev A simple bank contract that allows users to deposit and withdraw a specific ERC20 token
 */
contract PPTokenBank {
    IERC20Token public token;
    
    // Mapping to track user deposits: user address => amount
    mapping(address => uint256) public deposits;
    
    // Total deposits in the bank
    uint256 public totalDeposits;
    
    // Event emitted when a user deposits tokens
    event Deposit(address indexed user, uint256 amount);
    
    // Event emitted when a user withdraws tokens
    event Withdraw(address indexed user, uint256 amount);

    /**
     * @dev Constructor that sets the token contract
     * @param _token The ERC20 token address
     */
    constructor(address _token) {
        //address check
        require(_token != address(0), "Invalid token address");
        console2.log("Initializing bank with token: %s", _token);
        token = IERC20Token(_token);
    }

    /**
     * @dev Deposit tokens into the bank
     * @param amount The amount of tokens to deposit
     */
    function deposit(uint256 amount) external {
        console2.log("Deposit: user: %s, Amount: %d", msg.sender, amount/1e18);
        console2.log("User balance before deposit: %d", deposits[msg.sender]/1e18);
        console2.log("Bank total deposits before deposit: %d", totalDeposits/1e18);
        
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        // Update user's deposit balance
        deposits[msg.sender] += amount;
        
        // Update total deposits
        totalDeposits += amount;
        
        console2.log("Deposit completed");
        console2.log("User balance after deposit: %d", deposits[msg.sender]/1e18);
        console2.log("Bank total deposits after deposit: %d", totalDeposits/1e18);
        
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Withdraw tokens from the bank
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external {
        console2.log("Withdraw: user: %s, Amount: %d", msg.sender, amount/1e18);
        console2.log("User balance before withdraw: %d", deposits[msg.sender]/1e18);
        console2.log("Bank total deposits before withdraw: %d", totalDeposits/1e18);
        
        require(amount > 0, "Amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        // Update user's deposit balance
        deposits[msg.sender] -= amount;
        
        // Update total deposits
        totalDeposits -= amount;
        
        // Transfer tokens from this contract to user
        bool success = token.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
        
        console2.log("Withdraw completed");
        console2.log("User balance after withdraw: %d", deposits[msg.sender]/1e18);
        console2.log("Bank total deposits after withdraw: %d", totalDeposits/1e18);
        
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Get the balance of a user
     * @param user The user address
     * @return The user's deposit balance
     */
    function getDepositBalance(address user) external view returns (uint256) {
        uint256 balance = deposits[user];
        console2.log("Querying deposit balance: user: %s, balance: %d", user, balance/10**18);
        
        return balance;
    }
    
    /**
     * @dev Get the token balance of this contract
     * @return The contract's token balance
     */
    function getContractTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}