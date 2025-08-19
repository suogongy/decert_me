// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/IERC20.sol";
import "../src/ERC20.sol";
import "../src/TokenBank.sol";

contract TokenBankTest is Test {
    ERC20 token;
    TokenBank bank;
    address user1 = address(0x1111);
    address user2 = address(0x2222);

    function setUp() public {
        // Deploy token contract with name "Test Token" and symbol "TEST"
        token = new ERC20("Test Token", "TEST");
        
        // Deploy bank contract with the token address
        bank = new TokenBank(address(token));
        
        // Give some tokens to users for testing
        vm.prank(address(this)); // Reset to contract creator
        token.transfer(user1, 1000 * 10**18);
        
        vm.prank(address(this));
        token.transfer(user2, 1000 * 10**18);
    }

    // Test the transferWithHook function to a contract that implements ITokenReceiver
    function testTransferWithHookToReceiverContract() public {
        // User1 transfers tokens directly to bank using transferWithHook
        vm.prank(user1);
        token.transferWithHook(address(bank), 100 * 10**18);
        
        // Check that bank recorded the deposit via tokenReceived hook
        assertEq(bank.balances(user1), 100 * 10**18);
        
        // Check that bank's token balance increased
        assertEq(token.balanceOf(address(bank)), 100 * 10**18);
        
        // Check that user1's token balance decreased
        assertEq(token.balanceOf(user1), 900 * 10**18);
    }

    // Test transferWithHook to a regular account (not a contract)
    function testTransferWithHookToEOA() public {
        address receiver = address(0x3333);
        
        // User1 transfers tokens to a regular account
        vm.prank(user1);
        token.transferWithHook(receiver, 50 * 10**18);
        
        // Check that tokens were transferred
        assertEq(token.balanceOf(receiver), 50 * 10**18);
        assertEq(token.balanceOf(user1), 950 * 10**18);
    }

    // Test transferWithHook to a contract that doesn't implement tokenReceived
    function testTransferWithHookToNonReceiverContract() public {
        // Deploy a simple contract that doesn't implement tokenReceived
        address dummyContract = address(new DummyContract());
        
        // User1 transfers tokens to the dummy contract
        vm.prank(user1);
        token.transferWithHook(dummyContract, 50 * 10**18);
        
        // Check that tokens were transferred despite the contract not implementing tokenReceived
        assertEq(token.balanceOf(dummyContract), 50 * 10**18);
        assertEq(token.balanceOf(user1), 950 * 10**18);
    }
}

// Simple dummy contract for testing transferWithHook to contracts that don't implement tokenReceived
contract DummyContract {
    // This contract doesn't implement tokenReceived function
    function someFunction() public pure returns (uint256) {
        return 1;
    }
}