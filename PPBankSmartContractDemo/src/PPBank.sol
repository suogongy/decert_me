// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console2.sol";

contract Bank {
    address public bankManager;

    mapping (address => uint) deposits;

    constructor() {
        bankManager = msg.sender;
        console2.log("Bank contract deployed. Manager address:", bankManager);
    }

    receive() external payable {
        console2.log("Received direct ETH transfer from:", msg.sender, "Amount:", msg.value/1 ether);
        doDeposit();        
    }

    function deposit() external payable {
        console2.log("Deposit called by:", msg.sender, "Amount:", msg.value/1 ether);
        doDeposit();
    }

    function withdraw() external {
        console2.log("Withdraw called by:", msg.sender);
        require(msg.sender == bankManager, "Only bank manager can withdraw");
        console2.log("Access granted to manager for withdrawal");
        
        uint contractBalance = address(this).balance;
        console2.log("Contract balance:", contractBalance/1 ether);
        require(contractBalance > 0, "No balance in contract");
        
        console2.log("Transferring", contractBalance, "to manager:", msg.sender);
        payable(msg.sender).transfer(contractBalance);
        console2.log("Withdrawal completed successfully");
    }


    function balance() external view returns (uint) {
        uint userDeposit = deposits[msg.sender];
        console2.log("Deposit Balance requested by:", msg.sender, "Current balance:", userDeposit/1 ether);
        return userDeposit;
    }

    function doDeposit() public payable {
        console2.log("Processing deposit for:", msg.sender, "Amount:", msg.value/1 ether);
        deposits[msg.sender] += msg.value;
        console2.log("New deposit for sender: %s is: %s", msg.sender, deposits[msg.sender]/1 ether);
        //print sender balance whth address
        console2.log("Sender address: %s, balance: %s", msg.sender, msg.sender.balance/1 ether);
        //can add more logic here
    }
}