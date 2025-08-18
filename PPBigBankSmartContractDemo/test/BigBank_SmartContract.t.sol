// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Bank, BigBank, Admin, IBank} from "../src/BigBank_SmartContract.sol";

contract Receiver {
    receive() external payable {}
}

contract BankTest is Test {
    Bank public bank;
    address public owner;
    address public user1;
    address public user2;
    Receiver public receiver;

    function setUp() public {
        receiver = new Receiver();
        bank = new Bank();
        owner = bank.owner();
        user1 = address(1);
        user2 = address(2);
        
        // 给owner一些初始余额
        vm.deal(owner, 100 ether);
        vm.deal(address(receiver), 0);
    }

    // 测试存款功能
    function testDeposit() public {
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        
        bank.deposit{value: 5 ether}();
        vm.stopPrank();

        assertEq(bank.getDepositByAddress(user1), 5 ether);
    }

    // 测试所有者提取功能
    function testWithdraw() public {
        // 先存入一些资金
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();

        uint256 contractBalance = address(bank).balance;
        
        // 将Bank合约的所有者转移给receiver，因为它可以接收以太币
        vm.prank(owner);
        bank.transferOwnership(address(receiver));
        
        // 确保Bank合约本身有足够的以太币进行转账
        vm.deal(address(bank), contractBalance);

        // receiver作为所有者提取资金
        vm.startPrank(address(receiver));
        bank.withdraw();
        vm.stopPrank();

        assertEq(address(bank).balance, 0);
    }

    // 测试非所有者无法提取资金
    function testWithdrawNonOwner() public {
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert("Only owner can withdraw");
        bank.withdraw();
        vm.stopPrank();
    }

    // 测试查询用户存款
    function testGetDepositByAddress() public {
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 3 ether}();
        vm.stopPrank();

        uint256 deposit = bank.getDepositByAddress(user1);
        assertEq(deposit, 3 ether);
    }

    // 测试查询0地址存款应该失败
    function testGetDepositByAddressZeroAddress() public {
        vm.expectRevert("Invalid address");
        bank.getDepositByAddress(address(0));
    }

    // 测试查询无存款用户应该返回0
    function testGetDepositByAddressNoDeposit() public {
        uint256 deposit = bank.getDepositByAddress(user1);
        assertEq(deposit, 0);
    }
    
    // 添加接收以太币的能力
    receive() external payable {}
}

contract BigBankTest is Test {
    BigBank public bigBank;
    address public bigBankOwner;
    address public user1;
    address public user2;

    function setUp() public {
        bigBank = new BigBank();
        bigBankOwner = bigBank.bigBankOwner();
        user1 = address(1);
        user2 = address(2);
    }

    // 测试存款功能 - 小于10 ether应该成功
    function testDepositSuccess() public {
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bigBank.deposit{value: 5 ether}();
        vm.stopPrank();

        assertEq(bigBank.getDepositByAddress(user1), 5 ether);
    }

    // 测试存款功能 - 大于等于10 ether应该失败
    function testDepositFail() public {
        vm.deal(user1, 15 ether);
        vm.startPrank(user1);
        vm.expectRevert("deposit amount should be less than 10 ether");
        bigBank.deposit{value: 10 ether}();
        vm.stopPrank();
    }

    // 测试提款功能 - 存款大于20 ether应该成功
    function testWithdrawSuccess() public {
        // 先给用户足够资金
        vm.deal(user1, 100 ether);
        
        // 第一次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit1 = bigBank.getDepositByAddress(user1);
        assertEq(deposit1, 9 ether);
        
        // 第二次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit2 = bigBank.getDepositByAddress(user1);
        assertEq(deposit2, 18 ether);
        
        // 第三次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit3 = bigBank.getDepositByAddress(user1);
        assertEq(deposit3, 27 ether);

        // 确保合约本身有足够的以太币来支付提款
        vm.deal(address(bigBank), 27 ether);
        
        // 在调用withdraw之前再次检查存款
        uint256 depositBeforeWithdraw = bigBank.getDepositByAddress(user1);
        assertEq(depositBeforeWithdraw, 27 ether);
        
        vm.startPrank(user1);
        bigBank.withdraw();
        vm.stopPrank();

        assertEq(bigBank.getDepositByAddress(user1), 0);
    }

    // 测试提款功能 - 存款小于等于20 ether应该失败
    function testWithdrawFailInsufficientDeposit() public {
        vm.deal(user1, 20 ether);
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert("deposit amount should be greater than 20 ether");
        bigBank.withdraw();
        vm.stopPrank();
    }

    // 测试BigBank所有者不能提款
    function testBigBankOwnerCannotWithdraw() public {
        vm.deal(bigBankOwner, 30 ether);
        vm.startPrank(bigBankOwner);
        bigBank.deposit{value: 5 ether}(); // 存款少于10 ether
        vm.stopPrank();

        vm.startPrank(bigBankOwner);
        vm.expectRevert("Big Bank owner cannot withdraw");
        bigBank.withdraw();
        vm.stopPrank();
    }
}

contract AdminTest is Test {
    Bank public bank;
    BigBank public bigBank;
    Admin public adminContract;
    address public admin;
    address public user1;
    Receiver public receiver;

    function setUp() public {
        receiver = new Receiver();
        bank = new Bank();
        bigBank = new BigBank();
        adminContract = new Admin();
        admin = adminContract.ADMINISTRATOR();
        user1 = address(1);
        
        // 给账户一些初始余额
        vm.deal(admin, 100 ether);
        vm.deal(address(receiver), 100 ether);
    }

    // 测试管理员提取Bank合约资金
    function testAdminWithdrawFromBank() public {
        // 用户存款到Bank
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();

        // 将Bank合约的所有者设置为adminContract
        vm.prank(bank.owner());
        bank.transferOwnership(address(adminContract));

        uint256 contractBalance = address(bank).balance;

        // 确保Bank合约有足够的余额
        vm.deal(address(bank), contractBalance);

        // 管理员提取资金
        vm.startPrank(admin);
        adminContract.adminWithdraw(IBank(address(bank)));
        vm.stopPrank();

        assertEq(address(bank).balance, 0);
    }

    // 测试非管理员无法提取资金
    function testNonAdminCannotWithdraw() public {
        vm.deal(user1, 10 ether);
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert("Only admin can withdraw");
        adminContract.adminWithdraw(IBank(address(bank)));
        vm.stopPrank();
    }

    // 测试管理员提取Admin合约自身资金
    function testWithdrawToAdmin() public {
        // 先给Admin合约转入资金
        deal(address(adminContract), 5 ether);
        
        uint256 initialAdminBalance = address(admin).balance;
        
        vm.startPrank(admin);
        adminContract.withdrawToAdmin();
        vm.stopPrank();

        assertEq(address(adminContract).balance, 0);
        assertEq(address(admin).balance, initialAdminBalance + 5 ether);
    }

    // 测试无余额时提取应该失败
    function testWithdrawToAdminNoBalance() public {
        vm.startPrank(admin);
        vm.expectRevert("No balance to withdraw");
        adminContract.withdrawToAdmin();
        vm.stopPrank();
    }

    // 测试非管理员无法调用withdrawToAdmin
    function testNonAdminCannotWithdrawToAdmin() public {
        deal(address(adminContract), 5 ether);
        
        vm.startPrank(user1);
        vm.expectRevert("Only admin can withdraw");
        adminContract.withdrawToAdmin();
        vm.stopPrank();
    }
    
    // 添加接收以太币的能力
    receive() external payable {}
}