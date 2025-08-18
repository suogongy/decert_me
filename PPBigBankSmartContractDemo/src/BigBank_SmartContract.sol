// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;

import "forge-std/console2.sol";

interface IBank {
    function deposit() external payable;
    function withdraw() external;
    function getDepositByAddress(address user) external view returns (uint);
}

contract Bank is IBank {
    address public owner;
    mapping(address => uint) public deposits;
    
    constructor() {
        owner = msg.sender;
        console2.log("Bank: Contract deployed, owner: %s", owner);
    }

    function deposit() external payable virtual {
        console2.log("Bank: Deposit function called by: %s", msg.sender);
        console2.log("Bank: Deposit amount: %e ether", msg.value);
        console2.log("Bank: User balance before deposit: %e ether", deposits[msg.sender]);
        
        deposits[msg.sender] += msg.value;
        
        console2.log("Bank: User balance after deposit: %e ether", deposits[msg.sender]);
        console2.log("Bank: Contract balance after deposit: %e ether", address(this).balance);
    }

    function withdraw() external virtual {
        console2.log("Bank: Withdraw function called by: %s", msg.sender);
        console2.log("Bank: Only owner can withdraw. Owner: %s, Caller: %s", owner, msg.sender);
        //only owner can withdraw
        require(msg.sender == owner, "Only owner can withdraw");
        
        uint balance = address(this).balance;
        console2.log("Bank: Withdraw amount: %e ether", balance);
        
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        require(sent, "Failed to send Ether");
        
        console2.log("Bank: Withdrawal successful. Recipient: %s", msg.sender);
        console2.log("Bank: Contract balance after withdrawal: %e ether", address(this).balance);
    }

    function getDepositByAddress(
        address user
    ) external view override returns (uint) {
        console2.log("Bank: getDepositByAddress called for user: %s", user);
        require(user != address(0), "Invalid address");
        // 移除了存款必须大于0的检查，这样在提款后可以查询到0余额
        uint deposit = deposits[user];
        console2.log("Bank: Deposit amount for user %s: %e ether", user, deposit);
        return deposit;
    }
    
    function transferOwnership(address newOwner) public {
        console2.log("Bank: transferOwnership called by: %s", msg.sender);
        console2.log("Bank: Current owner: %s, New owner: %s", owner, newOwner);
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
        console2.log("Bank: Ownership transferred successfully to: %s", newOwner);
    }
}

contract BigBank is Bank {
    address public bigBankOwner;
    
    constructor() {
        bigBankOwner = msg.sender;
        console2.log("BigBank: Contract deployed, bigBankOwner: %s", bigBankOwner);
    }

    function deposit() external payable override {
        console2.log("BigBank: Deposit function called by: %s", msg.sender);
        console2.log("BigBank: Deposit amount: %e ether", msg.value);
        console2.log("BigBank: User balance before deposit: %e ether", deposits[msg.sender]);
        
        require(msg.value < 10 ether, "deposit amount should be less than 10 ether");
        deposits[msg.sender] += msg.value;
        
        console2.log("BigBank: User balance after deposit: %e ether", deposits[msg.sender]);
        console2.log("BigBank: Contract balance after deposit: %e ether", address(this).balance);
    }

    function withdraw() external override {
        console2.log("BigBank: Withdraw function called by: %s", msg.sender);
        console2.log("BigBank: BigBank owner: %s, Caller: %s", bigBankOwner, msg.sender);
        require(msg.sender != bigBankOwner, "Big Bank owner cannot withdraw");
        
        uint256 amount = deposits[msg.sender];
        console2.log("BigBank: User deposit amount: %e ether", amount);

        require(amount > 20 ether, "deposit amount should be greater than 20 ether");
        
        uint256 transferAmount = deposits[msg.sender];
        deposits[msg.sender] = 0;
        
        console2.log("BigBank: Transfer amount: %e ether", transferAmount);

        (bool sent, ) = payable(msg.sender).call{value: transferAmount}("");
        require(sent, "Failed to send Ether");
        
        console2.log("BigBank: Withdrawal successful. Recipient: %s", msg.sender);
        console2.log("BigBank: User balance after withdrawal: %e ether", deposits[msg.sender]);
        console2.log("BigBank: Contract balance after withdrawal: %e ether", address(this).balance);
    }
}

contract Admin{
    address public immutable ADMINISTRATOR;
    
    // 添加接收以太币的能力
    receive() external payable {}

    constructor(){
        ADMINISTRATOR = msg.sender;
        console2.log("Admin: Contract deployed, administrator: %s", ADMINISTRATOR);
    }

    function adminWithdraw(IBank iBank) external{
        console2.log("Admin: adminWithdraw called by: %s", msg.sender);
        console2.log("Admin: Only admin can withdraw. Admin: %s, Caller: %s", ADMINISTRATOR, msg.sender);
        require(msg.sender == ADMINISTRATOR, "Only admin can withdraw");
        // 由于我们无法直接获取提取金额，我们只记录调用事件
        console2.log("Admin: Calling iBank.withdraw()");
        iBank.withdraw(); 
        console2.log("Admin: adminWithdraw completed");
    }

    function withdrawToAdmin() external{
        console2.log("Admin: withdrawToAdmin called by: %s", msg.sender);
        console2.log("Admin: Only admin can withdraw. Admin: %s, Caller: %s", ADMINISTRATOR, msg.sender);
        require(msg.sender == ADMINISTRATOR, "Only admin can withdraw");
        uint balance = address(this).balance;
        console2.log("Admin: Contract balance: %e ether", balance);
        require(balance > 0, "No balance to withdraw");
        // payable(admin).transfer(balance);
        (bool result,) = payable(ADMINISTRATOR).call{value: balance}("");
        require(result, "Failed to withdraw");
        console2.log("Admin: Withdrawal to admin successful. Admin: %s, Amount: %e ether", ADMINISTRATOR, balance);
    }
}