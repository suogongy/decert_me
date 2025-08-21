import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// Account and client setup
const privateKey = (import.meta.env.VITE_PRIVATE_KEY)
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

// 1. Manual EIP-1559 transaction building
async function buildRawTransaction() {
  try {
    console.log('Building raw EIP-1559 transaction...')
    
    // Get current gas prices
    const maxFeePerGas = await publicClient.getGasPrice()
    const maxPriorityFeePerGas = 2000000000n // 2 gwei
    
    // Using correct checksum address format
    const recipientAddress = '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
    
    // Transaction parameters
    const transaction = {
      to: recipientAddress,
      value: parseEther('0.001'),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      nonce: await publicClient.getTransactionCount({ address: account.address }),
      data: '0x',
      chain: mainnet
    }
    
    console.log('Transaction parameters:', transaction)
    
    // 2. Using prepareTransactionRequest to prepare transaction
    const preparedTx = await walletClient.prepareTransactionRequest({
      to: recipientAddress,
      value: parseEther('0.001'),
      account
    })
    
    console.log('Prepared transaction:', preparedTx)
    
    // 3. Transaction signing (simulated)
    console.log('Signing transaction with account:', account.address)
    
    // 4. Broadcasting transaction (not actually sending in this example)
    console.log('Transaction would be broadcast to the network')
    
    // 5. Waiting for confirmation (simulated)
    console.log('Waiting for transaction confirmation...')
    console.log('Transaction confirmed!')
    
  } catch (error) {
    console.error('Error building raw transaction:', error)
  }
}

buildRawTransaction()