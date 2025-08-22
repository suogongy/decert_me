// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console2.sol";

contract MultiSigWallet {
    // Events
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event AddOwner(address indexed owner);
    event RemoveOwner(address indexed owner);
    event ChangeRequiredConfirmations(uint256 requiredConfirmations);

    // Structures
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    // Mapping to keep track of confirmations
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    // Mapping to check if an address is an owner
    mapping(address => bool) public isOwner;

    // State variables
    address[] public owners;
    Transaction[] public transactions;
    uint256 public requiredConfirmations;
    uint256 public transactionCounter;

    // Modifiers
    modifier onlyOwner() {
        console2.log("Checking if caller is owner: %s", msg.sender);
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        console2.log("Checking if transaction %s exists", _txIndex);
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        console2.log("Checking if transaction %s is not executed", _txIndex);
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        console2.log("Checking if transaction %s is not confirmed by %s", _txIndex, msg.sender);
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed");
        _;
    }

    modifier confirmed(uint256 _txIndex) {
        console2.log("Checking if transaction %s is confirmed by %s", _txIndex, msg.sender);
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");
        _;
    }

    // Constructor
    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        console2.log("Deploying MultiSigWallet with %s owners and %s required confirmations", _owners.length, _requiredConfirmations);
        
        require(_owners.length > 0, "Owners required");
        require(
            _requiredConfirmations > 0 && _requiredConfirmations <= _owners.length,
            "Invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            console2.log("Adding owner: %s", owner);
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
        }
        owners = _owners;
        requiredConfirmations = _requiredConfirmations;
        
        console2.log("MultiSigWallet deployed successfully");
    }

    // Fallback function to receive Ether
    receive() external payable {
        console2.log("Received %s ETH from %s. New balance: %s", msg.value, msg.sender, address(this).balance);
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // Submit a new transaction
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;
        console2.log("Submitting transaction %s: to=%s, value=%s", txIndex, _to, _value);

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
        console2.log("Transaction %s submitted successfully", txIndex);
    }

    // Confirm a transaction
    function confirmTransaction(
        uint256 _txIndex
    )
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        
        console2.log("Owner %s confirmed transaction %s. Total confirmations: %s", msg.sender, _txIndex, transaction.numConfirmations);

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    // Execute a confirmed transaction
    function executeTransaction(
        uint256 _txIndex
    )
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        // Store the confirmation count before execution
        uint256 confirmationsBefore = transaction.numConfirmations;
        
        require(
            confirmationsBefore >= requiredConfirmations,
            "Cannot execute transaction"
        );
        
        console2.log("Executing transaction %s with %s confirmations (required: %s)", _txIndex, confirmationsBefore, requiredConfirmations);

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        
        // Additional safety check - ensure we still meet requirements even if there was a race condition
        // This check helps with state consistency but doesn't prevent execution as the transfer already happened
        if (transaction.numConfirmations < requiredConfirmations) {
            console2.log("Warning: Transaction %s executed with fewer confirmations (%s) than required (%s) due to race condition", 
                _txIndex, transaction.numConfirmations, requiredConfirmations);
        }
        
        require(success, "Transaction failed");
        
        console2.log("Transaction %s executed successfully", _txIndex);

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    // Revoke confirmation for a transaction
    function revokeConfirmation(
        uint256 _txIndex
    )
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        confirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(!transaction.executed, "Transaction already executed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        
        console2.log("Owner %s revoked confirmation for transaction %s. Total confirmations: %s", msg.sender, _txIndex, transaction.numConfirmations);

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // Add a new owner
    function addOwner(address _owner) public onlyOwner {
        console2.log("Adding new owner: %s", _owner);
        require(_owner != address(0), "Invalid owner");
        require(!isOwner[_owner], "Owner already exists");

        isOwner[_owner] = true;
        owners.push(_owner);

        emit AddOwner(_owner);
        console2.log("Owner %s added successfully", _owner);
    }

    // Remove an owner
    function removeOwner(address _owner) public onlyOwner {
        console2.log("Removing owner: %s", _owner);
        require(isOwner[_owner], "Not an owner");
        require(owners.length > requiredConfirmations, "Cannot remove owner");

        isOwner[_owner] = false;

        for (uint256 i = 0; i < owners.length - 1; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        }
        owners.pop();
        
        console2.log("Owner %s removed successfully", _owner);

        emit RemoveOwner(_owner);
    }

    // Change number of required confirmations
    function changeRequiredConfirmations(
        uint256 _requiredConfirmations
    ) public onlyOwner {
        console2.log("Changing required confirmations from %s to %s", requiredConfirmations, _requiredConfirmations);
        require(
            _requiredConfirmations > 0 &&
                _requiredConfirmations <= owners.length,
            "Invalid number of required confirmations"
        );
        requiredConfirmations = _requiredConfirmations;
        
        console2.log("Required confirmations changed to %s", _requiredConfirmations);

        emit ChangeRequiredConfirmations(_requiredConfirmations);
    }

    // Get transaction details
    function getTransaction(
        uint256 _txIndex
    )
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        console2.log("Getting transaction details for transaction %s", _txIndex);
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }

    // Get owners list
    function getOwners() public view returns (address[] memory) {
        console2.log("Getting list of %s owners", owners.length);
        return owners;
    }

    // Get transactions count
    function getTransactionCount() public view returns (uint256) {
        console2.log("Getting transaction count: %s", transactions.length);
        return transactions.length;
    }
}