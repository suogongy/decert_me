// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IERC20.sol";

interface IExtendedERC20 is IERC20 {
    function transferWithCallback(address to, uint256 amount) external returns (bool);
    function transferWithCallback(address to, uint256 amount, bytes calldata data) external returns (bool);
}