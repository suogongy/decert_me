import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'

// 1. Account creation and management
const privateKey = (import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as `0x${string}`

export async function runBasicExample(rpcUrl?: string, privateKeyParam?: `0x${string}`, chainId?: string) {
  const account = privateKeyToAccount(privateKeyParam || privateKey)
  console.log('Account address:', account.address)

  // 2. Network connection configuration
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(rpcUrl || import.meta.env.VITE_AVAIL_RPC_URL)
  })

  const walletClient = createWalletClient({
    chain: foundry,
    transport: http(rpcUrl || import.meta.env.VITE_AVAIL_RPC_URL),
    account
  })

  console.log('Chain:', publicClient.chain.name)
  console.log('RPC URL:', rpcUrl || import.meta.env.VITE_AVAIL_RPC_URL)

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
      
      // Example: Send a real transaction
      console.log('Sending a real transaction...')
      
      // Get balance before transaction
      const senderBalanceBefore = await publicClient.getBalance({
        address: account.address,
      })
      
      const receiverAddress = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720' as `0x${string}`
      const receiverBalanceBefore = await publicClient.getBalance({
        address: receiverAddress,
      })
      
      console.log('Balances Before Transaction:')
      console.log('- Sender:', formatEther(senderBalanceBefore), 'ETH')
      console.log('- Receiver:', formatEther(receiverBalanceBefore), 'ETH')
      
      // Send the transaction
      const txHash = await walletClient.sendTransaction({
        to: receiverAddress,
        value: parseEther('0.001'),
      })
      
      console.log('Transaction hash:', txHash)
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      })
      
      // Validate receipt status
      if (receipt.status === 'success') {
        console.log('Transaction successful!')
      } else {
        console.log('Transaction failed!')
      }
      
      console.log('Transaction confirmed in block:', receipt.blockNumber)
      console.log('Gas used:', receipt.gasUsed)
      console.log('Effective gas price:', receipt.effectiveGasPrice)
      console.log('Transaction status:', receipt.status)
      
      // Get balance after transaction
      const senderBalanceAfter = await publicClient.getBalance({
        address: account.address,
      })
      
      const receiverBalanceAfter = await publicClient.getBalance({
        address: receiverAddress,
      })
      
      console.log('Balances After Transaction:')
      console.log('- Sender:', formatEther(senderBalanceAfter), 'ETH')
      console.log('- Receiver:', formatEther(receiverBalanceAfter), 'ETH')
      
      // Calculate the changes
      const senderBalanceChange = senderBalanceBefore - senderBalanceAfter
      const receiverBalanceChange = receiverBalanceAfter - receiverBalanceBefore
      
      console.log('Balance Changes:')
      console.log('- Sender:', formatEther(senderBalanceChange), 'ETH')
      console.log('- Receiver:', formatEther(receiverBalanceChange), 'ETH')
      
      // Additional transaction details
      console.log('Transaction Details:')
      console.log('- From:', account.address)
      console.log('- To:', receiverAddress)
      console.log('- Value:', formatEther(receipt.cumulativeGasUsed * receipt.effectiveGasPrice + parseEther('0.001')), 'ETH')
      console.log('- Gas fee:', formatEther(receipt.cumulativeGasUsed * receipt.effectiveGasPrice), 'ETH')
      
    } catch (error) {
      console.error('Error in basic operations:', error)
    }
  }

  await demonstrateBasicOperations()
}