// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Bank} from "../src/PPBank.sol";

contract BankTest is Test {
    Bank public bank;
    address public bankManager;
    address public user1;
    address public user2;

    function setUp() public {
        bankManager = address(this);
        bank = new Bank();
        user1 = address(0xa0Ee7A142d267C1f36714E4a8F75612F20a79720);
        user2 = address(0x976EA74026E726554dB657fA54763abd0C3a0aa9);
    }

    function testDeposit() public {
        // 测试存款功能
        vm.deal(user1, 1000 ether);
        vm.startPrank(user1);
        bank.deposit{value: 400 ether}();
        // 验证存款余额
        assertEq(bank.balance(), 400 ether);
        vm.stopPrank();
    }

    function testReceive() public {
        // 测试直接向合约转账
        vm.deal(user1, 10 ether);
        console2.log("sender: %s, balance before call:", user1, user1.balance/1 ether);
        vm.startPrank(user1);
        (bool sent, ) = address(bank).call{value: 1 ether}("");
        assertTrue(sent);

        (bool sent2, ) = address(bank).call{value: 1 ether}("");
        assertTrue(sent2);


        // 验证存款余额
        assertEq(bank.balance(), 2 ether);
        assertEq(user1.balance, 8 ether);
        vm.stopPrank();
    }

    function testWithdraw() public {
        // 先存款
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 1 ether}();
        vm.stopPrank();

        // 银行管理员提取资金
        uint256 balanceBefore = bankManager.balance;
        bank.withdraw();
        uint256 balanceAfter = bankManager.balance;

        // 验证提取金额
        assertEq(balanceAfter - balanceBefore, 1 ether);
    }

    function test_RevertWhen_NonManagerWithdraw() public {
        // 先存款
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 1 ether}();
        vm.stopPrank();

        // 非管理员尝试提取资金应该失败
        vm.startPrank(user2);
        vm.expectRevert("Only bank manager can withdraw");
        bank.withdraw();
        vm.stopPrank();
    }

    function testMultipleDeposits() public {
        // 用户1存款
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 1 ether}();
        bank.deposit{value: 2 ether}();
        // 验证用户1余额
        assertEq(bank.balance(), 3 ether);
        vm.stopPrank();

        // 用户2存款
        vm.deal(user2, 10 ether);
        vm.startPrank(user2);
        bank.deposit{value: 3 ether}();
        // 验证用户2余额
        assertEq(bank.balance(), 3 ether);
        vm.stopPrank();
    }

    receive() external payable {}
}