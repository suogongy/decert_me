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
}]

// Updated to accept parameters for interactive mode
export async function runTokenBasics(rpcUrl?: string, privateKey?: string, chainId?: string) {
  console.log('=== ERC20 Token Operations Demo ===')
  
  // Use provided values or fall back to environment variables
  const finalPrivateKey = (privateKey || import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as `0x${string}`
  const account = privateKeyToAccount(finalPrivateKey)
  console.log('Account address:', account.address)

  if(chainId === undefined){
    chainId = import.meta.env.VITE_ANVIL_CHAIN
  }

  // Determine chain based on chainId
  let chain
  if (chainId === '31337') {
    chain = foundry
  } else {
    throw new Error('Invalid chainId')
  }

  // Use provided RPC URL or fall back to environment variable
  const finalRpcUrl = rpcUrl || import.meta.env.VITE_ANVIL_RPC_URL
  
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(finalRpcUrl)
  })

  const walletClient = createWalletClient({
    chain: chain,
    transport: http(finalRpcUrl),
    account
  })

  console.log('Chain:', publicClient.chain.name)
  console.log('RPC URL:', finalRpcUrl)
  
  // Query token balance
  async function getTokenBalance() {
    try {
      const balance = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
      
      const decimals = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals'
      })
      
      console.log(`Token balance: ${formatEther(balance as bigint)} tokens`)
      console.log(`Token decimals: ${decimals}`)
    } catch (error) {
      console.error('Error getting token balance:', error)
    }
  }

  // Transfer tokens to another address
  async function transferTokens(to: `0x${string}`, amount: bigint) {
    try {
      console.log(`\nTransfer ${formatEther(amount)} tokens to ${to}`)
      
      // Check balances before transfer
      const fromBalanceBefore = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
      console.log(`From account balance before: ${formatEther(fromBalanceBefore as bigint)} tokens`)
      
      let toBalanceBefore;
      try {
        toBalanceBefore = await publicClient.readContract({
          address: TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [to]
        })
        console.log(`To account balance before: ${formatEther(toBalanceBefore as bigint)} tokens`)
      } catch (error) {
        console.log('Could not retrieve receiver balance before transaction')
      }
      
      // Simulate the transaction first
      const { request } = await publicClient.simulateContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount],
        account,
      })
      
    //   console.log('Transfer simulation successful')
      
      // In a real application, you would send the transaction:
      const hash = await walletClient.writeContract(request)
      console.log('Transfer transaction hash:', hash)
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed!')
      console.log('Block number:', receipt.blockNumber)
      console.log('Transaction status:', receipt.status)
      console.log('Gas used:', receipt.gasUsed)
      console.log('Effective gas price:', receipt.effectiveGasPrice)
      
      // Check balances after transfer
      const fromBalanceAfter = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
      console.log(`From account balance after: ${formatEther(fromBalanceAfter as bigint)} tokens`)
      
      try {
        const toBalanceAfter = await publicClient.readContract({
          address: TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [to]
        })
        console.log(`To account balance after: ${formatEther(toBalanceAfter as bigint)} tokens`)
        
        // Calculate the difference
        if (toBalanceBefore) {
          const toBalanceDiff = (toBalanceAfter as bigint) - (toBalanceBefore as bigint)
          console.log(`To account balance change: ${formatEther(toBalanceDiff)} tokens`)
        }
      } catch (error) {
        console.log('Could not retrieve receiver balance after transaction')
      }
      
      // Calculate sender balance difference
      const fromBalanceDiff = (fromBalanceBefore as bigint) - (fromBalanceAfter as bigint)
      console.log(`From account balance change: ${formatEther(fromBalanceDiff)} tokens`)
      
      if (receipt.status === 'success') {
        console.log('Transfer completed successfully!')
      } else {
        console.log('Transfer failed!')
      }
    } catch (error) {
      console.error('Error transferring tokens:', error)
    }
  }

  // Approve a spender to use tokens
  async function approveSpender(spender: `0x${string}`, amount: bigint) {
    try {
      console.log(`\nApprove ${formatEther(amount)} tokens for spender ${spender}`)
      
      // Check current allowance before approval
      const currentAllowance = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, spender]
      })
      
      console.log(`Current allowance before: ${formatEther(currentAllowance as bigint)} tokens`)
      
      // First approval: set allowance to 0
      console.log('\n--- Step 1: Setting allowance to 0 ---')
      const { request: requestZero } = await publicClient.simulateContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, 0n],
        account,
      })
      
      const hashZero = await walletClient.writeContract(requestZero)
      console.log('Approval to zero transaction hash:', hashZero)
      
      // Wait for first transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receiptZero = await publicClient.waitForTransactionReceipt({ hash: hashZero })
      console.log('Transaction confirmed!')
      console.log('Block number:', receiptZero.blockNumber)
      console.log('Transaction status:', receiptZero.status)
      console.log('Gas used:', receiptZero.gasUsed)
      console.log('Effective gas price:', receiptZero.effectiveGasPrice)
      
      // Check allowance after first approval
      const allowanceAfterZero = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, spender]
      })
      console.log(`Allowance after setting to zero: ${formatEther(allowanceAfterZero as bigint)} tokens`)
      
      if (receiptZero.status === 'success') {
        console.log('Approval to zero completed successfully!')
      } else {
        console.log('Approval to zero failed!')
        return;
      }
      
      // Second approval: set allowance to the desired amount
      console.log('\n--- Step 2: Setting allowance to desired amount ---')
      const { request } = await publicClient.simulateContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
        account,
      })
      
      const hash = await walletClient.writeContract(request)
      console.log('Approval transaction hash:', hash)
      
      // Wait for second transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed!')
      console.log('Block number:', receipt.blockNumber)
      console.log('Transaction status:', receipt.status)
      console.log('Gas used:', receipt.gasUsed)
      console.log('Effective gas price:', receipt.effectiveGasPrice)
      
      // Check allowance after approval
      const newAllowance = await publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, spender]
      })
      console.log(`New allowance after: ${formatEther(newAllowance as bigint)} tokens`)
      
      if (receipt.status === 'success') {
        console.log('Approval completed successfully!')
      } else {
        console.log('Approval failed!')
      }
    } catch (error) {
      console.error('Error approving spender:', error)
    }
  }

  // Demonstrate all ERC20 operations
  console.log('=== ERC20 Token Operations Demo ===')
  
  // Get token balance
  await getTokenBalance()
  
  // Demonstrate transfer (to a sample address with correct checksum)
  await transferTokens('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('12.1'))
  
  // Demonstrate approval
  await approveSpender('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('44.4'))
}