// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "./IERC20.sol";
import {ITokenReceiver} from "./ITokenReceiver.sol";
import "forge-std/console2.sol";

contract TokenBank is ITokenReceiver{
    IERC20 public token;
    mapping(address => uint256) public balances;
    
    // Track deposits to avoid double counting when using the deposit function
    mapping(address => bool) private _inDeposit;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event DirectDeposit(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        console2.log("TokenBank: Created bank for token at %s", _token);
    }

    function deposit(uint256 amount) external {
        console2.log("TokenBank: User %s depositing %s tokens via deposit function", msg.sender, amount / 1e18);
        _inDeposit[msg.sender] = true;
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        console2.log("TokenBank: Updated balance for %s: %s tokens", msg.sender, balances[msg.sender] / 1e18);
        _inDeposit[msg.sender] = false;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        console2.log("TokenBank: User %s withdrawing %s tokens", msg.sender, amount / 1e18);
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        console2.log("TokenBank: Updated balance for %s: %s tokens", msg.sender, balances[msg.sender] / 1e18);
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }
    
    // This function is called when tokens are sent directly to the contract
    function tokenReceived(address sender, uint256 amount) external {
        console2.log("TokenBank: Received tokenReceived call from %s for %s tokens by sender %s", msg.sender, amount / 1e18, sender);
        require(msg.sender == address(token), "Only token contract can call this function");
        
        if (!_inDeposit[sender]) {
            console2.log("TokenBank: Recording direct deposit for %s: %s tokens", sender, amount / 1e18);
            balances[sender] += amount;
            console2.log("TokenBank: Updated balance for %s: %s tokens", sender, balances[sender] / 1e18);
            emit DirectDeposit(sender, amount);
        } else {
            console2.log("TokenBank: Skipping direct deposit for %s as it's part of deposit() function", sender);
        }
    }
    
    // Helper function to get the bank's token balance
    function bankTokenBalance() public view returns (uint256) {
        uint256 balance = token.balanceOf(address(this));
        console2.log("TokenBank: Bank token balance: %s", balance / 1e18);
        return balance;
    }
}