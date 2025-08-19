// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

contract ERC20TokenTest is Test {
    ERC20Token public ppToken;
    
    // Test accounts
    address public alice = address(1);
    address public bob = address(2);

    function setUp() public {
        // Deploy token with name "PPToken", symbol "PPT", 18 decimals and 1 million initial supply
        ppToken = new ERC20Token("PPToken", "PPT", 18, 1_000_000);
    }

    function testMetadata() public view {
        assertEq(ppToken.name(), "PPToken");
        assertEq(ppToken.symbol(), "PPT");
        assertEq(ppToken.decimals(), 18);
        assertEq(ppToken.totalSupply(), 1_000_000 * 10**18);
    }

    function testTransfer() public {
        // Initially all tokens are with the deployer (test contract)
        assertEq(ppToken.balanceOf(address(this)), 1_000_000 * 10**18);
        assertEq(ppToken.balanceOf(alice), 0);
        
        // Transfer 1000 tokens to Alice
        bool success = ppToken.transfer(alice, 1000 * 10**18);
        assertTrue(success);
        
        // Check balances after transfer
        assertEq(ppToken.balanceOf(address(this)), 999_000 * 10**18);
        assertEq(ppToken.balanceOf(alice), 1000 * 10**18);
    }

    function testTransferInsufficientBalance() public {
        // Try to transfer more than balance
        bool success = ppToken.transfer(alice, 500 * 10**18);
        assertTrue(success);
        vm.prank(alice);
        assertTrue(success);
        vm.expectRevert("Insufficient balance");
        ppToken.transfer(address(this), 1000 * 10**18);
    }

    function testApprove() public {
        // Approve Alice to spend 500 tokens
        bool success = ppToken.approve(alice, 500 * 10**18);
        assertTrue(success);
        
        // Check allowance
        assertEq(ppToken.allowance(address(this), alice), 500 * 10**18);
    }

    function testTransferFrom() public {
        // Approve Alice to spend 500 tokens
        bool approveSuccess = ppToken.approve(alice, 500 * 10**18);
        assertTrue(approveSuccess);
        
        // Alice transfers 300 tokens from this contract to Bob
        vm.prank(alice);
        bool transferSuccess = ppToken.transferFrom(address(this), bob, 300 * 10**18);
        assertTrue(transferSuccess);
        
        // Check balances
        assertEq(ppToken.balanceOf(address(this)), 999_700 * 10**18); // 1_000_000 - 300
        assertEq(ppToken.balanceOf(bob), 300 * 10**18);
        assertEq(ppToken.balanceOf(alice), 0);
        
        // Check remaining allowance
        assertEq(ppToken.allowance(address(this), alice), 200 * 10**18); // 500 - 300
    }

    function testTransferFromInsufficientAllowance() public {
        // Approve Alice to spend 100 tokens
        bool approveSuccess = ppToken.approve(alice, 100 * 10**18);
        assertTrue(approveSuccess);
        
        // Alice tries to transfer 200 tokens
        vm.prank(alice);
        vm.expectRevert("Insufficient allowance");
        ppToken.transferFrom(address(this), bob, 200 * 10**18); // forgefmt: disable-line
        // This call is expected to revert, so we don't check the return value
    }

    function testTransferFromInsufficientBalance() public {
        // Give Alice a lot of allowance
        bool approveSuccess = ppToken.approve(alice, 2_000_000 * 10**18);
        assertTrue(approveSuccess);
        
        // But try to transfer more than owner's balance
        vm.prank(alice);
        vm.expectRevert("Insufficient sender balance");
        ppToken.transferFrom(address(this), bob, 2_000_000 * 10**18); // forgefmt: disable-line
        // This call is expected to revert, so we don't check the return value
    }

    function testFuzz_Transfer(uint96 amount) public {
        // Limit amount to prevent overflow and keep within owner's balance
        amount = uint96(bound(amount, 0, ppToken.balanceOf(address(this)) / 10**18)) * 10**18;
        
        uint256 ownerInitialBalance = ppToken.balanceOf(address(this));
        uint256 aliceInitialBalance = ppToken.balanceOf(alice);
        
        bool success = ppToken.transfer(alice, amount);
        assertTrue(success);
        
        assertEq(ppToken.balanceOf(address(this)), ownerInitialBalance - amount);
        assertEq(ppToken.balanceOf(alice), aliceInitialBalance + amount);
    }
}