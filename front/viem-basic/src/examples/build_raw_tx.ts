import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry, mainnet } from 'viem/chains'

// Updated to accept parameters for interactive mode
export async function runBuildRawTx(rpcUrl?: string, privateKey?: string, chainId?: string) {
  console.log('=== Building Raw EIP-1559 Transaction ===')
  
  // Use provided values or fall back to environment variables
  const finalPrivateKey = (privateKey || import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as `0x${string}`
  const account = privateKeyToAccount(finalPrivateKey)

  // Determine chain based on chainId - default to foundry for local testing

  if(chainId === undefined){
    chainId=import.meta.env.VITE_ANVIL_CHAIN
  }

    console.log('Account address: %s, chainId: %s', account.address,chainId)

  let chain: any
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
  
  console.log('Chain:', publicClient.chain.name)
  console.log('RPC URL:', finalRpcUrl)

  const walletClient = createWalletClient({
    chain: chain,
    transport: http(finalRpcUrl),
    account
  })
  
  // 1. Manual EIP-1559 transaction building
  async function buildRawTransaction() {
    try {
      console.log('Building raw EIP-1559 transaction...')
      
      // Define recipient address
      const recipientAddress = '0x976EA74026E726554dB657fA54763abd0C3a0aa9';
      
      // Get account balances before transaction
      const fromBalanceBefore = await publicClient.getBalance({ address: account.address })
      console.log('From account balance before:', formatEther(fromBalanceBefore), 'ETH')
      
      const toBalanceBefore = await publicClient.getBalance({ address: recipientAddress })
      console.log('To account balance before:', formatEther(toBalanceBefore), 'ETH')
      
      // 2. Using prepareTransactionRequest to prepare transaction
      const preparedTx = await walletClient.prepareTransactionRequest({
        chain,
        to: recipientAddress,
        value: parseEther('0.001'),
        account
      })
      
      console.log('Prepared transaction:', preparedTx)
      
      // 3. Transaction signing and broadcasting
      console.log('Signing and sending transaction with account:', account.address)
      
      // 4. Broadcasting transaction
      let txHash: `0x${string}`;
      try {
        txHash = await walletClient.sendTransaction(preparedTx as any)
        console.log('Transaction sent with hash:', txHash)
      } catch (sendError: any) {
        // Even if sendTransaction throws an error, the transaction may have been sent
        // Try to extract the transaction hash from the error if possible
        console.log('Error sending transaction:', sendError.message)
        if (sendError.message.includes('nonce too low')) {
          console.log('Transaction may have already been sent with a previous call.')
          // In this case, we continue with the flow as the transaction might have actually been sent
          // We can't get the hash from the error, so we skip to waiting for confirmation
          throw sendError;
        } else {
          throw sendError;
        }
      }
      
      // 5. Waiting for confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      console.log('Transaction confirmed with status:', receipt.status)
      
      // Get account balances after transaction
      const fromBalanceAfter = await publicClient.getBalance({ address: account.address })
      console.log('From account balance after:', formatEther(fromBalanceAfter), 'ETH')
      
      const toBalanceAfter = await publicClient.getBalance({ address: recipientAddress })
      console.log('To account balance after:', formatEther(toBalanceAfter), 'ETH')
      
      // Calculate the difference
      const fromBalanceDiff = fromBalanceBefore - fromBalanceAfter
      console.log('From account balance change:', formatEther(fromBalanceDiff), 'ETH')
      
      const toBalanceDiff = toBalanceAfter - toBalanceBefore
      console.log('To account balance change:', formatEther(toBalanceDiff), 'ETH')
      
    } catch (error) {
      console.error('Error building raw transaction:', error)
      throw error;
    }
  }

  await buildRawTransaction()
}