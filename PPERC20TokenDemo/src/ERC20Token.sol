// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Import Forge's console2 library for debugging logs
import {console2} from "forge-std/console2.sol";

/**
 * @title ERC20Token
 * @dev Implementation of ERC20 token contract
 */
contract ERC20Token {
    // Token name
    string public name;
    
    // Token symbol
    string public symbol;
    
    // Token decimals,ethereum has 18 decimals
    uint8 public decimals;
    
    // Total supply of tokens
    uint256 public totalSupply;

    // Account balance mapping: address => balance
    mapping(address => uint256) public balanceOf;
    
    // Allowance mapping: owner address => spender address => allowance amount
    mapping(address => mapping(address => uint256)) public allowances;

    // Transfer event
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    // Approval event
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Contract constructor, initializes token information
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Token decimals
     * @param _totalSupply Token total supply (without decimals, will be internally multiplied by 10^decimals)
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) { 
        console2.log("Initializing token: %s (%s)", _name, _symbol);
        console2.log("Decimals: %d, Initial supply: %d", _decimals, _totalSupply);
        
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        
        console2.log("Contract creator: %s", msg.sender);
        console2.log("Contract creator balance: %d", balanceOf[msg.sender]/1e18);
    }

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     * @param to Address to receive tokens
     * @param amount Transfer amount
     * @return success Whether the transfer was successful
     */
    function transfer(address to, uint256 amount) external returns (bool success) {
        console2.log("Transfer: %s -> %s, Amount: %d", msg.sender, to, amount/1e18);
        console2.log("Sender balance: %d", balanceOf[msg.sender]/1 ether);
        console2.log("Receiver balance: %d", balanceOf[to]/1e18);
        
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        
        console2.log("Transfer completed, sender new balance: %d", balanceOf[msg.sender]/1e18);
        console2.log("Transfer completed, receiver new balance: %d", balanceOf[to]/1e18);
        return true;
    }

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the allowance mechanism.
     * `amount` is then deducted from the caller's allowance.
     * @param from Address to send tokens from
     * @param to Address to receive tokens
     * @param amount Transfer amount
     * @return success Whether the transfer was successful
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool success) { 
        console2.log("Authorized transfer: %s -> %s, Amount: %d", from, to, amount/1e18);
        console2.log("Operator: %s", msg.sender);
        console2.log("Sender balance: %d", balanceOf[from]/1e18);
        console2.log("Receiver balance: %d", balanceOf[to]/1e18);
        console2.log("Allowance amount: %d", allowances[from][msg.sender]/1e18);
        
        require(balanceOf[from] >= amount, "Insufficient sender balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        
        console2.log("Authorized transfer completed, sender new balance: %d", balanceOf[from]/1e18);
        console2.log("Authorized transfer completed, receiver new balance: %d", balanceOf[to]/1e18);
        console2.log("Remaining allowance: %d", allowances[from][msg.sender]/1e18);
        return true;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     * @param spender The approved address
     * @param amount The approved amount
     * @return success Whether the approval was successful
     */
    function approve(address spender, uint256 amount) external returns (bool success) {
        console2.log("Approval: %s approves %s to transfer %d tokens", msg.sender, spender, amount/1e18);
        
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        
        console2.log("Approval completed");
        return true;
    }

    /**
     * @dev Returns the remaining number of tokens that `spender` is allowed
     * to spend on behalf of `owner`
     * @param owner The address that owns the tokens
     * @param spender The approved address
     * @return remaining Remaining allowance amount
     */
    function allowance(address owner, address spender) external view returns (uint256 remaining) {
        uint256 allowanceValue = allowances[owner][spender];
        console2.log("Querying allowance: owner: (%s) approves spender: (%s) with an amount of: %d", owner, spender, allowanceValue/1e18);
        return allowanceValue;
    }
}