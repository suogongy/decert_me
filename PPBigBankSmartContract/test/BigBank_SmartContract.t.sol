// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Bank, BigBank, Admin, IBank} from "../src/BigBank_SmartContract.sol";
import "forge-std/console2.sol";

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
        
        console2.log("BankTest: Setup completed");
        console2.log("BankTest: Owner address: %s", owner);
        console2.log("BankTest: User1 address: %s", user1);
        console2.log("BankTest: User2 address: %s", user2);
    }

    // 测试存款功能
    function testDeposit() public {
        console2.log("BankTest: Starting testDeposit");
        vm.deal(user1, 10 ether);
        console2.log("BankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();
        
        console2.log("BankTest: User1 deposited 5 ether");

        assertEq(bank.getDepositByAddress(user1), 5 ether);
        console2.log("BankTest: testDeposit completed successfully");
    }

    // 测试所有者提取功能
    function testWithdraw() public {
        console2.log("BankTest: Starting testWithdraw");
        // 先存入一些资金
        vm.deal(user1, 10 ether);
        console2.log("BankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();
        
        console2.log("BankTest: User1 deposited 5 ether");

        // 将Bank合约的所有者转移给receiver，因为它可以接收以太币
        vm.prank(owner);
        bank.transferOwnership(address(receiver));

        // receiver作为所有者提取资金
        vm.startPrank(address(receiver));
        bank.withdraw();
        vm.stopPrank();
        
        console2.log("BankTest: Receiver withdrew funds");

        assertEq(address(bank).balance, 0);
        console2.log("BankTest: testWithdraw completed successfully");
    }

    // 测试非所有者无法提取资金
    function testWithdrawNonOwner() public {
        console2.log("BankTest: Starting testWithdrawNonOwner");
        vm.deal(user1, 10 ether);
        console2.log("BankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();
        
        console2.log("BankTest: User1 deposited 5 ether");

        vm.startPrank(user1);
        vm.expectRevert("Only owner can withdraw");
        bank.withdraw();
        vm.stopPrank();
        
        console2.log("BankTest: testWithdrawNonOwner completed successfully - revert as expected");
    }

    // 测试查询用户存款
    function testGetDepositByAddress() public {
        console2.log("BankTest: Starting testGetDepositByAddress");
        vm.deal(user1, 10 ether);
        console2.log("BankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 3 ether}();
        vm.stopPrank();
        
        console2.log("BankTest: User1 deposited 3 ether");

        uint256 deposit = bank.getDepositByAddress(user1);
        assertEq(deposit, 3 ether);
        console2.log("BankTest: testGetDepositByAddress completed successfully");
    }

    // 测试查询0地址存款应该失败
    function testGetDepositByAddressZeroAddress() public {
        console2.log("BankTest: Starting testGetDepositByAddressZeroAddress");
        vm.expectRevert("Invalid address");
        bank.getDepositByAddress(address(0));
        console2.log("BankTest: testGetDepositByAddressZeroAddress completed successfully - revert as expected");
    }

    // 测试查询无存款用户应该返回0
    function testGetDepositByAddressNoDeposit() public {
        console2.log("BankTest: Starting testGetDepositByAddressNoDeposit");
        uint256 deposit = bank.getDepositByAddress(user1);
        assertEq(deposit, 0);
        console2.log("BankTest: testGetDepositByAddressNoDeposit completed successfully");
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
        
        console2.log("BigBankTest: Setup completed");
        console2.log("BigBankTest: BigBankOwner address: %s", bigBankOwner);
        console2.log("BigBankTest: User1 address: %s", user1);
        console2.log("BigBankTest: User2 address: %s", user2);
    }

    // 测试存款功能 - 小于10 ether应该成功
    function testDepositSuccess() public {
        console2.log("BigBankTest: Starting testDepositSuccess");
        vm.deal(user1, 10 ether);
        console2.log("BigBankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bigBank.deposit{value: 5 ether}();
        vm.stopPrank();
        
        console2.log("BigBankTest: User1 deposited 5 ether");

        assertEq(bigBank.getDepositByAddress(user1), 5 ether);
        console2.log("BigBankTest: testDepositSuccess completed successfully");
    }

    // 测试存款功能 - 大于等于10 ether应该失败
    function testDepositFail() public {
        console2.log("BigBankTest: Starting testDepositFail");
        vm.deal(user1, 15 ether);
        console2.log("BigBankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        vm.expectRevert("deposit amount should be less than 10 ether");
        bigBank.deposit{value: 10 ether}();
        vm.stopPrank();
        
        console2.log("BigBankTest: testDepositFail completed successfully - revert as expected");
    }

    // 测试提款功能 - 存款大于20 ether应该成功
    function testWithdrawSuccess() public {
        console2.log("BigBankTest: Starting testWithdrawSuccess");
        // 先给用户足够资金
        vm.deal(user1, 100 ether);
        console2.log("BigBankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        // 第一次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit1 = bigBank.getDepositByAddress(user1);
        assertEq(deposit1, 9 ether);
        console2.log("BigBankTest: User1 deposited 9 ether. Total deposit: %e ether", deposit1);
        
        // 第二次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit2 = bigBank.getDepositByAddress(user1);
        assertEq(deposit2, 18 ether);
        console2.log("BigBankTest: User1 deposited another 9 ether. Total deposit: %e ether", deposit2);
        
        // 第三次存款
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        uint256 deposit3 = bigBank.getDepositByAddress(user1);
        assertEq(deposit3, 27 ether);
        console2.log("BigBankTest: User1 deposited another 9 ether. Total deposit: %e ether", deposit3);

        // 确保合约本身有足够的以太币来支付提款
        vm.deal(address(bigBank), 27 ether);
        console2.log("BigBankTest: BigBank contract balance after vm.deal: %e ether", address(bigBank).balance);
        
        // 在调用withdraw之前再次检查存款
        uint256 depositBeforeWithdraw = bigBank.getDepositByAddress(user1);
        assertEq(depositBeforeWithdraw, 27 ether);
        console2.log("BigBankTest: Deposit before withdrawal: %e ether", depositBeforeWithdraw);
        
        vm.startPrank(user1);
        bigBank.withdraw();
        vm.stopPrank();
        
        console2.log("BigBankTest: User1 withdrew funds");

        assertEq(bigBank.getDepositByAddress(user1), 0);
        console2.log("BigBankTest: testWithdrawSuccess completed successfully");
    }

    // 测试提款功能 - 存款小于等于20 ether应该失败
    function testWithdrawFailInsufficientDeposit() public {
        console2.log("BigBankTest: Starting testWithdrawFailInsufficientDeposit");
        vm.deal(user1, 20 ether);
        console2.log("BigBankTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bigBank.deposit{value: 9 ether}();
        vm.stopPrank();
        console2.log("BigBankTest: User1 deposited 9 ether");

        vm.startPrank(user1);
        vm.expectRevert("deposit amount should be greater than 20 ether");
        bigBank.withdraw();
        vm.stopPrank();
        
        console2.log("BigBankTest: testWithdrawFailInsufficientDeposit completed successfully - revert as expected");
    }

    // 测试BigBank所有者不能提款
    function testBigBankOwnerCannotWithdraw() public {
        console2.log("BigBankTest: Starting testBigBankOwnerCannotWithdraw");
        vm.deal(bigBankOwner, 30 ether);
        console2.log("BigBankTest: BigBankOwner balance after vm.deal: %e ether", bigBankOwner.balance);
        
        vm.startPrank(bigBankOwner);
        bigBank.deposit{value: 5 ether}(); // 存款少于10 ether
        vm.stopPrank();
        console2.log("BigBankTest: BigBankOwner deposited 5 ether");

        vm.startPrank(bigBankOwner);
        vm.expectRevert("Big Bank owner cannot withdraw");
        bigBank.withdraw();
        vm.stopPrank();
        
        console2.log("BigBankTest: testBigBankOwnerCannotWithdraw completed successfully - revert as expected");
    }
}

contract AdminTest is Test {
    Bank public bank;
    BigBank public bigBank;
    Admin public adminContract;
    address public admin;
    address public user1;

    function setUp() public {
        bank = new Bank();
        bigBank = new BigBank();
        adminContract = new Admin();
        admin = adminContract.ADMINISTRATOR();
        user1 = address(1);
        
        // 给账户一些初始余额
        vm.deal(admin, 100 ether);
        
        console2.log("AdminTest: Setup completed");
        console2.log("AdminTest: Admin address: %s", admin);
        console2.log("AdminTest: User1 address: %s", user1);
    }

    // 测试管理员提取Bank合约资金
    function testAdminWithdrawFromBank() public {
        console2.log("AdminTest: Starting testAdminWithdrawFromBank");
        // 用户存款到Bank
        vm.deal(user1, 10 ether);
        console2.log("AdminTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();
        console2.log("AdminTest: User1 deposited 5 ether");

        // 将Bank合约的所有者设置为adminContract
        vm.prank(bank.owner());
        bank.transferOwnership(address(adminContract));
        console2.log("AdminTest: Transferred bank ownership to admin contract");

        // 管理员提取资金
        vm.startPrank(admin);
        adminContract.adminWithdraw(IBank(address(bank)));
        vm.stopPrank();
        console2.log("AdminTest: Admin withdrew funds from bank");

        assertEq(address(bank).balance, 0);
        console2.log("AdminTest: testAdminWithdrawFromBank completed successfully");
    }

    // 测试非管理员无法提取资金
    function testNonAdminCannotWithdraw() public {
        console2.log("AdminTest: Starting testNonAdminCannotWithdraw");
        vm.deal(user1, 10 ether);
        console2.log("AdminTest: User1 balance after vm.deal: %e ether", user1.balance);
        
        vm.startPrank(user1);
        bank.deposit{value: 5 ether}();
        vm.stopPrank();
        console2.log("AdminTest: User1 deposited 5 ether");

        vm.startPrank(user1);
        vm.expectRevert("Only admin can withdraw");
        adminContract.adminWithdraw(IBank(address(bank)));
        vm.stopPrank();
        
        console2.log("AdminTest: testNonAdminCannotWithdraw completed successfully - revert as expected");
    }

    // 测试管理员提取Admin合约自身资金
    function testWithdrawToAdmin() public {
        console2.log("AdminTest: Starting testWithdrawToAdmin");
        // 先给Admin合约转入资金
        deal(address(adminContract), 5 ether);
        console2.log("AdminTest: Admin contract balance after deal: %e ether", address(adminContract).balance);
        
        uint256 initialAdminBalance = address(admin).balance;
        console2.log("AdminTest: Initial admin balance: %e ether", initialAdminBalance);
        
        vm.startPrank(admin);
        adminContract.withdrawToAdmin();
        vm.stopPrank();
        console2.log("AdminTest: Admin withdrew funds to admin address");

        assertEq(address(adminContract).balance, 0);
        assertEq(address(admin).balance, initialAdminBalance + 5 ether);
        console2.log("AdminTest: Admin final balance: %e ether", address(admin).balance);
        console2.log("AdminTest: testWithdrawToAdmin completed successfully");
    }

    // 测试无余额时提取应该失败
    function testWithdrawToAdminNoBalance() public {
        console2.log("AdminTest: Starting testWithdrawToAdminNoBalance");
        vm.startPrank(admin);
        vm.expectRevert("No balance to withdraw");
        adminContract.withdrawToAdmin();
        vm.stopPrank();
        
        console2.log("AdminTest: testWithdrawToAdminNoBalance completed successfully - revert as expected");
    }

    // 测试非管理员无法调用withdrawToAdmin
    function testNonAdminCannotWithdrawToAdmin() public {
        console2.log("AdminTest: Starting testNonAdminCannotWithdrawToAdmin");
        deal(address(adminContract), 5 ether);
        console2.log("AdminTest: Admin contract balance after deal: %e ether", address(adminContract).balance);
        
        vm.startPrank(user1);
        vm.expectRevert("Only admin can withdraw");
        adminContract.withdrawToAdmin();
        vm.stopPrank();
        
        console2.log("AdminTest: testNonAdminCannotWithdrawToAdmin completed successfully - revert as expected");
    }
    
    // 添加接收以太币的能力
    receive() external payable {}
}