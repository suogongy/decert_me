// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;

interface IBank {
    // 添加事件
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    
    function deposit() external payable;
    function withdraw() external;
    function getDepositByAddress(address user) external view returns (uint);
}

contract Bank is IBank {
    address public owner;
    mapping(address => uint) public deposits;
    
    // 添加事件
    event OwnerSet(address owner);
    event DepositByAddress(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
        emit OwnerSet(msg.sender);
    }

    function deposit() external payable virtual {
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
        emit DepositByAddress(msg.sender, deposits[msg.sender]);
    }

    function withdraw() external virtual {
        //only owner can withdraw
        require(msg.sender == owner, "Only owner can withdraw");
        uint balance = address(this).balance;
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        require(sent, "Failed to send Ether");
        emit Withdraw(msg.sender, balance);
    }

    function getDepositByAddress(
        address user
    ) external view override returns (uint) {
        require(user != address(0), "Invalid address");
        // 移除了存款必须大于0的检查，这样在提款后可以查询到0余额
        return deposits[user];
    }
    
    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract BigBank is Bank {
    address public bigBankOwner;
    
    // 添加事件
    event BigBankOwnerSet(address owner);
    event BigBankDeposit(address indexed user, uint256 amount);
    event BigBankWithdraw(address indexed user, uint256 amount);

    constructor() {
        bigBankOwner = msg.sender;
        emit BigBankOwnerSet(msg.sender);
    }

    function deposit() external payable override {
        require(msg.value < 10 ether, "deposit amount should be less than 10 ether");
        deposits[msg.sender] += msg.value;
        emit BigBankDeposit(msg.sender, msg.value);
        emit DepositByAddress(msg.sender, deposits[msg.sender]);
    }

    function withdraw() external override {
        require(msg.sender != bigBankOwner, "Big Bank owner cannot withdraw");

        uint256 amount = deposits[msg.sender];

        require(amount > 20 ether, "deposit amount should be greater than 20 ether");
        
        uint256 transferAmount = deposits[msg.sender];
        deposits[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: transferAmount}("");
        require(sent, "Failed to send Ether");
        
        emit BigBankWithdraw(msg.sender, transferAmount);
    }
}

contract Admin{
    address public immutable ADMINISTRATOR;
    
    // 添加事件
    event AdministratorSet(address admin);
    event AdminWithdrawal(address admin, uint256 amount);
    event AdminWithdrawToAdmin(address admin, uint256 amount);
    
    // 添加接收以太币的能力
    receive() external payable {}

    constructor(){
        ADMINISTRATOR = msg.sender;
        emit AdministratorSet(msg.sender);
    }

    function adminWithdraw(IBank iBank) external{
        require(msg.sender == ADMINISTRATOR, "Only admin can withdraw");
        // 由于我们无法直接获取提取金额，我们只记录调用事件
        iBank.withdraw(); 
        emit AdminWithdrawal(msg.sender, address(iBank).balance);
    }

    function withdrawToAdmin() external{
        require(msg.sender == ADMINISTRATOR, "Only admin can withdraw");
        uint balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        // payable(admin).transfer(balance);
        (bool result,) = payable(ADMINISTRATOR).call{value: balance}("");
        require(result, "Failed to withdraw");
        emit AdminWithdrawToAdmin(msg.sender, balance);
    }
}