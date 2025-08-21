import { createWalletClient, createPublicClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// 1. Account creation and management
const privateKey = (import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as `0x${string}`
const account = privateKeyToAccount(privateKey)
console.log('Account address:', account.address)

// 2. Network connection configuration
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL)
})

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL),
  account
})

console.log('Chain:', publicClient.chain.name)
console.log('RPC URL:', import.meta.env.VITE_ETHEREUM_RPC_URL)

// 3. Basic transaction operation
async function demonstrateBasicOperations() {
  try {
    // Get account balance
    const balance = await publicClient.getBalance({
      address: account.address,
    })
    
    console.log('Account balance:', formatEther(balance), 'ETH')
    
    // Get the current block number
    const blockNumber = await publicClient.getBlockNumber()
    console.log('Current block number:', blockNumber)
    
    // Example: Prepare to send a transaction (not actually sending)
    console.log('Example transaction preparation:')
    console.log('- From:', account.address)
    console.log('- To: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720')
    console.log('- Value:', '0.001 ETH')
    
  } catch (error) {
    console.error('Error in basic operations:', error)
  }
}

demonstrateBasicOperations()