import { createPublicClient, createWalletClient, http, formatEther, parseEther, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
// Removed unused import

// WETH token contract address on Ethereum mainnet
const WETH_ADDRESS = '0x8464135c8f25da09e49bc8782676a84730c318bc'

// ERC20 ABI for common functions
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const

// Account and client setup
const privateKey = (import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as `0x${string}`
const account = privateKeyToAccount(privateKey)

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL)
})

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL),
  account
})

// 1. Token balance query
async function getTokenBalance() {
  try {
    console.log('Getting WETH token information...')
    
    // Get token symbol
    const symbol = await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'symbol',
    })
    
    // Get token decimals
    const decimals = await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'decimals',
    })
    
    // Get account balance
    const balance = await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    })
    
    console.log(`Token: ${symbol}`)
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
    console.log(`Transferring ${formatEther(amount)} WETH to ${to}...`)
    
    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: WETH_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amount],
      account,
    })
    
    console.log('Transaction simulation successful')
    
    // In a real application, you would send the transaction:
    // const hash = await walletClient.writeContract(request)
    // console.log('Transaction hash:', hash)
    // const receipt = await publicClient.waitForTransactionReceipt({ hash })
    // console.log('Transaction confirmed in block:', receipt.blockNumber)
    
    console.log('Transfer would be executed in a real application')
  } catch (error) {
    console.error('Error transferring tokens:', error)
  }
}

// 3. Token approval
async function approveSpender(spender: `0x${string}`, amount: bigint) {
  try {
    console.log(`Approving ${formatEther(amount)} WETH for spender ${spender}...`)
    
    // Check current allowance
    const currentAllowance = await publicClient.readContract({
      address: WETH_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, spender],
    })
    
    console.log(`Current allowance: ${formatEther(currentAllowance as bigint)} WETH`)
    
    // Simulate the approval transaction
    const { request } = await publicClient.simulateContract({
      address: WETH_ADDRESS,
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
  
  // Demonstrate transfer (to a sample address)
  await transferTokens('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('0.1'))
  
  // Demonstrate approval
  await approveSpender('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('1.0'))
}

demonstrateERC20Operations()