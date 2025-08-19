// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ITokenReceiver} from "./ITokenReceiver.sol";
import "forge-std/console2.sol";

contract ERC20{

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    string public name; 
    string public symbol; 
    uint8 public decimals; 

    uint256 public totalSupply; 

    mapping (address => uint256) balances; 

    mapping (address => mapping (address => uint256)) allowances; 


    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
        decimals = 18;
        
        // Give the contract creator a large amount of tokens
        uint256 initialSupply = 100000 * 10**18; // 100,000 tokens
        balances[msg.sender] = initialSupply;
        totalSupply = initialSupply;
        console2.log("ERC20: initial supply of %s tokens to %s", initialSupply / 1e18, msg.sender);
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        console2.log("ERC20: Checking balance of %s: %s tokens", account, balances[account] / 1e18);
        return balances[account];
    }

    function transfer(address to, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        console2.log("ERC20: Transferring %s tokens from %s to %s", amount / 1e18, owner, to);
        _transfer(owner, to, amount);
        return true;
    }

    function transferWithHook(address to, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        console2.log("ERC20: Transferring %s tokens from %s to %s with hook", amount / 1e18, owner, to);
        _transfer(owner, to, amount);
        if (to.code.length > 0) {
            console2.log("ERC20: Receiver %s is a contract, calling tokenReceived hook", to);
            try ITokenReceiver(to).tokenReceived(owner, amount) {
                console2.log("ERC20: Successfully called tokenReceived on %s", to);
            } catch {
                console2.log("ERC20: Failed to call tokenReceived on %s, but transfer completed", to);
            }
        } else {
            console2.log("ERC20: Receiver %s is an EOA, skipping hook", to);
        }
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual returns (bool) {
        address spender = msg.sender;
        console2.log("ERC20: Transferring %s tokens from %s to %s", amount / 1e18, from, to);
        console2.log("ERC20: Spender is %s", spender);
        uint256 currentAllowance = allowance(from, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            _approve(from, spender, currentAllowance - amount);
            console2.log("ERC20: Updated allowance for spender %s: %s tokens remaining", spender, (currentAllowance - amount) / 1e18);
        }
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        console2.log("ERC20: Approving %s to spend %s tokens for %s", spender, amount / 1e18, owner);
        _approve(owner, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {
        console2.log("ERC20: Allowance of %s by %s: %s tokens", spender, owner, allowances[owner][spender] / 1e18);
        return allowances[owner][spender];
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        console2.log("ERC20: Internal transfer of %s tokens from %s to %s", amount / 1e18, from, to);

        require(balances[from] >= amount, "ERC20: transfer amount exceeds balance");
        balances[from] -= amount;
        console2.log("ERC20: Deducted %s tokens from %s, new balance: %s", amount / 1e18, from, balances[from] / 1e18);
        balances[to] += amount;
        console2.log("ERC20: Added %s tokens to %s, new balance: %s", amount / 1e18, to, balances[to] / 1e18);

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        console2.log("ERC20: Internal approval of %s tokens by %s for spender %s", amount / 1e18, owner, spender);

        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}