// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

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
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _transfer(from, to, amount);
        return true;
    }

    function transferWithCallback(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        if (isContract(to)) {
            _callTokensReceived(to, msg.sender, amount, "");
        }
        return true;
    }

    function transferWithCallback(address to, uint256 amount, bytes calldata data) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        if (isContract(to)) {
            _callTokensReceived(to, msg.sender, amount, data);
        }
        return true;
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
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
        return account.code.length > 0;
    }

    function _callTokensReceived(address to, address from, uint256 amount, bytes memory data) private {
        (bool success, ) = to.call(abi.encodeWithSignature("onTokensReceived(address,address,uint256,bytes)", from, to, amount, data));
        require(success, "ERC20: transfer to non ERC20Receiver implementer");
    }
}