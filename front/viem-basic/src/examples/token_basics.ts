import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, foundry } from 'viem/chains'

// ERC20 token contract address (使用你部署的合约地址)
const TOKEN_ADDRESS = '0x8464135c8f25da09e49bc8782676a84730c318bc'

// ERC20 ABI for common functions
const ERC20_ABI = [{
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
		"name": "initialSupply",
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
		"name": "",
		"type": "bool",
		"internalType": "bool"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "balanceOf",
	"inputs": [{
		"name": "account",
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
		"name": "",
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
		"name": "",
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
}] as const

// Account and client setup
const privateKey = (import.meta.env.VITE_PRIVATE_KEY) as `0x${string}`
const account = privateKeyToAccount(privateKey)

const publicClient = createPublicClient({
  chain: foundry,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL)
})

const walletClient = createWalletClient({
  chain: foundry,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL),
  account
})

// 1. Token balance query
async function getTokenBalance() {
  try {
    console.log('Getting token information...')
    
    // Get token name
    const name = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'name',
    })
    
    // Get token symbol
    const symbol = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'symbol',
    })
    
    // Get token decimals
    const decimals = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    })
    
    // Get account balance
    const balance = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    })
    
    console.log(`Token: ${name} (${symbol})`)
    console.log(`Decimals: ${decimals}`)
    console.log(`Balance: ${formatEther(balance as bigint)} ${symbol}`)
    
    return { symbol, decimals, balance }
  } catch (error) {
    console.error('Error getting token balance:', error)
  }
}

// 2. Token transfer
async function transferTokens(to: `0x${string}`, amount: bigint) {
  try {
    console.log(`Transferring ${formatEther(amount)} tokens to ${to}...`)
    
    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amount],
      account,
    })
    
    console.log('Transaction simulation successful')
    
    // In a real application, you would send the transaction:
    const hash = await walletClient.writeContract(request)
    console.log('Transaction hash:', hash)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Transaction confirmed in block:', receipt.blockNumber)
    
    console.log('Transfer would be executed in a real application')
  } catch (error) {
    console.error('Error transferring tokens:', error)
  }
}

// 3. Token approval
async function approveSpender(spender: `0x${string}`, amount: bigint) {
  try {
    console.log(`Approving ${formatEther(amount)} tokens for spender ${spender}...`)
    
    // Check current allowance
    const currentAllowance = await publicClient.readContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, spender],
    })
    
    console.log(`Current allowance: ${formatEther(currentAllowance as bigint)} tokens`)
    
    // Simulate the approval transaction
    const { request } = await publicClient.simulateContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
      account,
    })
    
    console.log('Approval simulation successful')
    
    // In a real application, you would send the transaction:
    const hash = await walletClient.writeContract(request)
    console.log('Approval transaction hash:', hash)
    
    console.log('Approval would be executed in a real application')
  } catch (error) {
    console.error('Error approving spender:', error)
  }
}

// Demonstrate all ERC20 operations
async function demonstrateERC20Operations() {
  console.log('=== ERC20 Token Operations Demo ===')
  
  // Get token balance
  await getTokenBalance()
  
  // Demonstrate transfer (to a sample address with correct checksum)
  await transferTokens('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('0.1'))
  
  // Demonstrate approval
  await approveSpender('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('1.0'))
}

demonstrateERC20Operations()