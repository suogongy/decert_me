// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ITokenReceiver {
    function onTokensReceived(address sender, address recipient, uint256 amount, bytes calldata data) external;
}