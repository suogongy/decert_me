// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title IERC20Token
 * @dev Interface for ERC20 token operations used by PPTokenBank
 */
interface IERC20Token {
    function transfer(address to, uint256 amount) external returns (bool success);
    function transferFrom(address from, address to, uint256 amount) external returns (bool success);
}