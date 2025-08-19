// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PPTokenBank} from "../src/PPTokenBank.sol";
import {ERC20Token} from "../src/ERC20Token.sol";
import {console2} from "forge-std/console2.sol";

contract PPTokenBankTest is Test {
    PPTokenBank public bank;
    ERC20Token public token;
    
    address public user1 = address(0x111);
    address public user2 = address(0x222);
    
    function setUp() public {
        // Deploy a test token with 18 decimals and 1,000,000 initial supply
        token = new ERC20Token("PPToken", "PPT", 18, 1000000);
        
        // Deploy the token bank contract
        bank = new PPTokenBank(address(token));
        
        // Mint tokens to users
        token.transfer(user1, 100000 * 1e18);
        token.transfer(user2, 100000 * 1e18);
    }
    
    function testDeposit() public {
        // User1 approves and deposits tokens
        vm.prank(user1);
        token.approve(address(bank), 1000 * 1e18);
        
        vm.prank(user1);
        bank.deposit(1000 * 1e18);
        
        // Check balances
        assertEq(bank.getDepositBalance(user1), 1000 * 1e18);
        assertEq(bank.totalDeposits(), 1000 * 1e18);
        assertEq(token.balanceOf(user1), 99000 * 1e18);
        assertEq(token.balanceOf(address(bank)), 1000 * 1e18);
    }
    
    function testWithdraw() public {
        // User1 deposits tokens first
        vm.prank(user1);
        token.approve(address(bank), 1000 * 1e18);
        
        vm.prank(user1);
        bank.deposit(1000 * 1e18);
        
        // User1 withdraws part of the tokens
        vm.prank(user1);
        bank.withdraw(400 * 1e18);
        
        // Check balances
        assertEq(bank.getDepositBalance(user1), 600 * 1e18);
        assertEq(bank.totalDeposits(), 600 * 1e18);
        assertEq(token.balanceOf(user1), 99400 * 1e18);
        assertEq(token.balanceOf(address(bank)), 600 * 1e18);
    }
    
    function test_RevertWhen_WithdrawMoreThanDeposit() public {
        // User1 deposits tokens
        vm.prank(user1);
        token.approve(address(bank), 1000 * 1e18);
        
        vm.prank(user1);
        bank.deposit(1000 * 1e18);
        
        // User1 tries to withdraw more than deposited - should fail
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        bank.withdraw(1001 * 1e18);
    }
    
    function testMultipleUsers() public {
        // Both users deposit tokens
        vm.prank(user1);
        token.approve(address(bank), 1000 * 1e18);
        
        vm.prank(user1);
        bank.deposit(1000 * 1e18);
        
        vm.prank(user2);
        token.approve(address(bank), 2000 * 1e18);
        
        vm.prank(user2);
        bank.deposit(2000 * 1e18);
        
        // Check balances
        assertEq(bank.getDepositBalance(user1), 1000 * 1e18);
        assertEq(bank.getDepositBalance(user2), 2000 * 1e18);
        assertEq(bank.totalDeposits(), 3000 * 1e18);
    }
}