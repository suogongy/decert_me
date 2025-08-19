// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ITokenReceiver {
    function tokenReceived(address sender, uint256 amount) external;
}