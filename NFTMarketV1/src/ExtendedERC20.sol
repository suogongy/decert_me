// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./IExtendedERC20.sol";

contract ExtendedERC20 is IExtendedERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = 18;
        console.log("ExtendedERC20: Contract deployed with name %s and symbol %s", name_, symbol_);
    }

    function name() public view returns (string memory) {
        console.log("ExtendedERC20: name() called, returning %s", _name);
        return _name;
    }

    function symbol() public view returns (string memory) {
        console.log("ExtendedERC20: symbol() called, returning %s", _symbol);
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        console.log("ExtendedERC20: decimals() called, returning %d", _decimals);
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        console.log("ExtendedERC20: totalSupply() called, returning %d", _totalSupply);
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256 balance = _balances[account];
        console.log("ExtendedERC20: balanceOf(%s) called, returning %d", account, balance);
        return balance;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        console.log("ExtendedERC20: transfer() called from %s to %s with amount %d", msg.sender, to, amount);
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        uint256 allowanceAmount = _allowances[owner][spender];
        console.log("ExtendedERC20: allowance() called for owner");
        console.logAddress(owner);
        console.log("spender");
        console.logAddress(spender);
        console.log("returning");
        console.logUint(allowanceAmount);
        return allowanceAmount;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        console.log("ExtendedERC20: approve() called by %s for spender %s with amount %d", msg.sender, spender, amount);
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        console.log("ExtendedERC20: transferFrom() called from");
        console.logAddress(from);
        console.log("by");
        console.logAddress(msg.sender);
        console.log("to");
        console.logAddress(to);
        console.log("amount");
        console.logUint(amount);
        uint256 currentAllowance = _allowances[from][msg.sender];
        console.log("ExtendedERC20: Current allowance for spender");
        console.logAddress(msg.sender);
        console.log("from owner");
        console.logAddress(from);
        console.log("is");
        console.logUint(currentAllowance);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
            console.log("ExtendedERC20: Updating allowance from");
            console.logUint(currentAllowance);
            console.log("to");
            console.logUint(currentAllowance - amount);
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _transfer(from, to, amount);
        return true;
    }

    function transferWithCallback(address to, uint256 amount) public override returns (bool) {
        console.log("ExtendedERC20: transferWithCallback() called from %s to %s with amount %d", msg.sender, to, amount);
        _transfer(msg.sender, to, amount);
        if (isContract(to)) {
            console.log("ExtendedERC20: Receiver %s is a contract, calling onTokensReceived", to);
            _callTokensReceived(to, msg.sender, amount, "");
        } else {
            console.log("ExtendedERC20: Receiver %s is an EOA, skipping callback", to);
        }
        return true;
    }

    function transferWithCallback(address to, uint256 amount, bytes calldata data) public override returns (bool) {
        console.log("ExtendedERC20: transferWithCallback() with data called from %s to %s with amount %d", msg.sender, to, amount);
        _transfer(msg.sender, to, amount);
        if (isContract(to)) {
            console.log("ExtendedERC20: Receiver %s is a contract, calling onTokensReceived with data", to);
            _callTokensReceived(to, msg.sender, amount, data);
        } else {
            console.log("ExtendedERC20: Receiver %s is an EOA, skipping callback", to);
        }
        return true;
    }

    function mint(address account, uint256 amount) public {
        console.log("ExtendedERC20: mint() called by %s to account %s with amount %d", msg.sender, account, amount);
        _mint(account, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        console.log("ExtendedERC20: _transfer() internal function executing transfer from %s to %s with amount %d", from, to, amount);
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        console.log("ExtendedERC20: Balance of sender %s before transfer: %d", from, fromBalance);
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        console.log("ExtendedERC20: Balance of sender %s after transfer: %d", from, _balances[from]);
        console.log("ExtendedERC20: Balance of receiver %s after transfer: %d", to, _balances[to]);

        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        console.log("ExtendedERC20: _mint() internal function minting to %s with amount %d", account, amount);
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        console.log("ExtendedERC20: Total supply after mint: %d", _totalSupply);
        console.log("ExtendedERC20: Balance of account %s after mint: %d", account, _balances[account]);
        emit Transfer(address(0), account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        console.log("ExtendedERC20: _approve() internal function approving for owner");
        console.logAddress(owner);
        console.log("spender");
        console.logAddress(spender);
        console.log("amount");
        console.logUint(amount);
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        console.log("ExtendedERC20: New allowance for spender");
        console.logAddress(spender);
        console.log("from owner");
        console.logAddress(owner);
        console.log(":");
        console.logUint(amount);
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Checks if an address is a contract
     * @param account The address to check
     * @return true if the address is a contract, false otherwise
     */
    function isContract(address account) internal view returns (bool) {
        // According to EVM specifications, contracts have associated code while 
        // externally owned accounts do not
        bool isContractAddress = account.code.length > 0;
        console.log("ExtendedERC20: isContract() checking %s, result: %s", account, isContractAddress ? "true" : "false");
        return isContractAddress;
    }

    function _callTokensReceived(address to, address from, uint256 amount, bytes memory data) private {
        console.log("ExtendedERC20: _callTokensReceived() calling onTokensReceived on %s", to);
        (bool success, ) = to.call(abi.encodeWithSignature("onTokensReceived(address,address,uint256,bytes)", from, to, amount, data));
        console.log("ExtendedERC20: Callback success: %s", success ? "true" : "false");
        require(success, "ERC20: transfer to non ERC20Receiver implementer");
    }
}