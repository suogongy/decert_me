// Contract addresses - to be updated with actual deployed addresses
export const CONTRACT_ADDRESSES = {
  sepolia: {
    tokenBank: '0x9A83B16Ea51A44BaAb3Ece16b184CA98d76D6511',
    token: '0xc9C8601D289Ec55C6E9c6660b7E3Dc2884d1E38D'
  }
};

// TokenBank contract ABI - to be updated with actual ABI
export const TOKEN_BANK_ABI = [{
	"type": "constructor",
	"inputs": [{
		"name": "_token",
		"type": "address",
		"internalType": "address"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "deposit",
	"inputs": [{
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "deposits",
	"inputs": [{
		"name": "",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "getContractTokenBalance",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "getDepositBalance",
	"inputs": [{
		"name": "user",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "token",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "address",
		"internalType": "contract IERC20Token"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "totalDeposits",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "withdraw",
	"inputs": [{
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [],
	"stateMutability": "nonpayable"
}, {
	"type": "event",
	"name": "Deposit",
	"inputs": [{
		"name": "user",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "amount",
		"type": "uint256",
		"indexed": false,
		"internalType": "uint256"
	}],
	"anonymous": false
}, {
	"type": "event",
	"name": "Withdraw",
	"inputs": [{
		"name": "user",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "amount",
		"type": "uint256",
		"indexed": false,
		"internalType": "uint256"
	}],
	"anonymous": false
}];

// Token contract ABI - to be updated with actual ABI
export const TOKEN_ABI = [{
	"type": "constructor",
	"inputs": [{
		"name": "_name",
		"type": "string",
		"internalType": "string"
	}, {
		"name": "_symbol",
		"type": "string",
		"internalType": "string"
	}, {
		"name": "_decimals",
		"type": "uint8",
		"internalType": "uint8"
	}, {
		"name": "_totalSupply",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "allowance",
	"inputs": [{
		"name": "owner",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "spender",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "remaining",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "allowances",
	"inputs": [{
		"name": "",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "approve",
	"inputs": [{
		"name": "spender",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [{
		"name": "success",
		"type": "bool",
		"internalType": "bool"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "balanceOf",
	"inputs": [{
		"name": "",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "decimals",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "uint8",
		"internalType": "uint8"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "name",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "string",
		"internalType": "string"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "symbol",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "string",
		"internalType": "string"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "totalSupply",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "transfer",
	"inputs": [{
		"name": "to",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [{
		"name": "success",
		"type": "bool",
		"internalType": "bool"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "transferFrom",
	"inputs": [{
		"name": "from",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "to",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [{
		"name": "success",
		"type": "bool",
		"internalType": "bool"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "event",
	"name": "Approval",
	"inputs": [{
		"name": "owner",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "spender",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "value",
		"type": "uint256",
		"indexed": false,
		"internalType": "uint256"
	}],
	"anonymous": false
}, {
	"type": "event",
	"name": "Transfer",
	"inputs": [{
		"name": "from",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "to",
		"type": "address",
		"indexed": true,
		"internalType": "address"
	}, {
		"name": "value",
		"type": "uint256",
		"indexed": false,
		"internalType": "uint256"
	}],
	"anonymous": false
}];