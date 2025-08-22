// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/MultiSigWallet.sol";

contract MultiSigWalletTest is Test {
    MultiSigWallet public multiSigWallet;
    address[] public owners;
    uint256 public requiredConfirmations = 2;

    // Test accounts
    address public owner1 = address(1);
    address public owner2 = address(2);
    address public owner3 = address(3);
    address public nonOwner = address(4);


    function setUp() public {
        owners.push(owner1);
        owners.push(owner2);
        owners.push(owner3);

        multiSigWallet = new MultiSigWallet(owners, requiredConfirmations);
    }

    function testSetup() public view {
        assertEq(multiSigWallet.getOwners().length, 3);
        assertEq(multiSigWallet.requiredConfirmations(), requiredConfirmations);
        assertTrue(multiSigWallet.isOwner(owner1));
        assertTrue(multiSigWallet.isOwner(owner2));
        assertTrue(multiSigWallet.isOwner(owner3));
        assertFalse(multiSigWallet.isOwner(nonOwner));
    }

    function testReceiveEther() public {
        vm.deal(owner1, 10 ether);
        vm.prank(owner1);
        (bool sent, ) = address(multiSigWallet).call{value: 1 ether}("");
        assertTrue(sent);
        assertEq(address(multiSigWallet).balance, 1 ether);
    }

    function testSubmitTransaction() public {
        vm.prank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");

        (, uint256 value, , bool executed, uint256 numConfirmations) = multiSigWallet.getTransaction(0);

        assertEq(value, 0.5 ether);
        assertFalse(executed);
        assertEq(numConfirmations, 0);
        assertFalse(multiSigWallet.isConfirmed(0, owner1));
    }

    function test_RevertWhen_NonOwnerSubmitsTransaction() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not an owner");
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
    }

    function testConfirmTransaction() public {
        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        vm.stopPrank();

        (, , , , uint256 numConfirmations) = multiSigWallet.getTransaction(0);
        assertEq(numConfirmations, 1);
        assertTrue(multiSigWallet.isConfirmed(0, owner1));
    }

    function test_RevertWhen_NonOwnerConfirmsTransaction() public {
        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        vm.stopPrank();

        vm.prank(nonOwner);
        vm.expectRevert("Not an owner");
        multiSigWallet.confirmTransaction(0);
    }

    function test_RevertWhen_ConfirmingNonExistentTransaction() public {
        vm.prank(owner1);
        vm.expectRevert("Transaction does not exist");
        multiSigWallet.confirmTransaction(0);
    }

    function test_RevertWhen_ConfirmingAlreadyConfirmedTransaction() public {
        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        vm.expectRevert("Transaction already confirmed");
        multiSigWallet.confirmTransaction(0); // Should fail
        vm.stopPrank();
    }

    function testExecuteTransaction() public {
        vm.deal(address(multiSigWallet), 2 ether);

        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(nonOwner, 0.5 ether, "");

        multiSigWallet.confirmTransaction(0);
        vm.stopPrank();

        vm.startPrank(owner2);

        multiSigWallet.confirmTransaction(0);

        multiSigWallet.executeTransaction(0);

        vm.stopPrank();

        (, , , bool executed, ) = multiSigWallet.getTransaction(0);
        assertTrue(executed);
        assertEq(nonOwner.balance, 0.5 ether);
    }

    function test_RevertWhen_ExecuteTransactionWithoutEnoughConfirmations() public {
        vm.deal(address(multiSigWallet), 2 ether);

        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        vm.expectRevert("Cannot execute transaction");
        multiSigWallet.executeTransaction(0); // Should fail
        vm.stopPrank();
    }

    function test_RevertWhen_ExecuteAlreadyExecutedTransaction() public {
        vm.deal(address(multiSigWallet), 2 ether);

        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        vm.stopPrank();

        vm.startPrank(owner2);
        multiSigWallet.confirmTransaction(0);
        multiSigWallet.executeTransaction(0);
        vm.expectRevert("Transaction already executed");
        multiSigWallet.executeTransaction(0); // Should fail
        vm.stopPrank();
    }

    function test_RevertWhen_ExecuteTransactionAfterConfirmationRevoked() public {
        vm.deal(address(multiSigWallet), 2 ether);

        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        vm.stopPrank();

        vm.startPrank(owner2);
        multiSigWallet.confirmTransaction(0);
        
        // Revoke confirmation before executing
        multiSigWallet.revokeConfirmation(0);
        vm.stopPrank();
        
        // Try to execute with only 1 confirmation (need 2)
        vm.startPrank(owner1);
        vm.expectRevert("Cannot execute transaction");
        multiSigWallet.executeTransaction(0);
        vm.stopPrank();
    }

    function testRevokeConfirmation() public {
        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        multiSigWallet.confirmTransaction(0);
        (, , , , uint256 numConfirmations) = multiSigWallet.getTransaction(0);
        assertEq(numConfirmations, 1);
        assertTrue(multiSigWallet.isConfirmed(0, owner1));

        multiSigWallet.revokeConfirmation(0);
        vm.stopPrank();

        (, , , , uint256 numConfirmationsAfterRevoke) = multiSigWallet.getTransaction(0);
        assertEq(numConfirmationsAfterRevoke, 0);
        assertFalse(multiSigWallet.isConfirmed(0, owner1));
    }

    function test_RevertWhen_NonConfirmerRevokesConfirmation() public {
        vm.startPrank(owner1);
        multiSigWallet.submitTransaction(owner2, 0.5 ether, "");
        vm.stopPrank();

        vm.startPrank(owner2);
        vm.expectRevert("Transaction not confirmed");
        multiSigWallet.revokeConfirmation(0); // Should fail
        vm.stopPrank();
    }

    function testAddOwner() public {
        vm.startPrank(owner1);
        multiSigWallet.addOwner(address(5));
        vm.stopPrank();

        assertTrue(multiSigWallet.isOwner(address(5)));
        assertEq(multiSigWallet.getOwners().length, 4);
    }

    function test_RevertWhen_NonOwnerAddsOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not an owner");
        multiSigWallet.addOwner(address(5));
    }

    function testRemoveOwner() public {
        vm.startPrank(owner1);
        multiSigWallet.removeOwner(owner3);
        vm.stopPrank();

        assertFalse(multiSigWallet.isOwner(owner3));
        assertEq(multiSigWallet.getOwners().length, 2);
    }

    function test_RevertWhen_NonOwnerRemovesOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not an owner");
        multiSigWallet.removeOwner(owner3);
    }

    function testChangeRequiredConfirmations() public {
        vm.startPrank(owner1);
        multiSigWallet.changeRequiredConfirmations(3);
        vm.stopPrank();

        assertEq(multiSigWallet.requiredConfirmations(), 3);
    }

    function test_RevertWhen_ChangeRequiredConfirmationsToInvalidValue() public {
        vm.startPrank(owner1);
        vm.expectRevert("Invalid number of required confirmations");
        multiSigWallet.changeRequiredConfirmations(5); // Should fail
        vm.stopPrank();
    }

    receive() external payable {}
}