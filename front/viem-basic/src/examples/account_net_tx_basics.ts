import { createWalletClient, createPublicClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'

// Updated to accept parameters for interactive mode
export async function runAccountBasics(rpcUrl?: string, privateKey?: string, chainId?: string) {
  console.log('=== Account, Network & Transaction Basics ===')
  
  // Use provided values or fall back to environment variables
  const finalPrivateKey = (privateKey || import.meta.env.VITE_PRIVATE_KEY) as `0x${string}`
  const account = privateKeyToAccount(finalPrivateKey)
  console.log('Account address:', account.address)

  if(!chainId) {
    chainId = import.meta.env.VITE_ANVIL_CHAIN
  }

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

  // 3. Basic transaction operation
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
    // console.log('Example transaction preparation:')
    // console.log('- From:', account.address)
    // console.log('- To: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720')
    // console.log('- Value:', '0.001 ETH')
    
    // Ask user if they want to send a real transaction
    console.log('\nTo send a real transaction, uncomment the code in the function below.')
    await sendRealTransaction(publicClient, walletClient, account.address)
    
  } catch (error) {
    console.error('Error in basic operations:', error)
  }
}

// Function to send a real transaction (commented out for safety)
async function sendRealTransaction(publicClient: any, walletClient: any, fromAddress: `0x${string}`) {
  try {
    console.log('\n--- Sending Real Transaction ---')
    
    const toAddress = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720';
    
    // Check balances before sending
    console.log('\n--- Balances Before Transaction ---');
    const fromBalanceBefore: bigint = await publicClient.getBalance({ address: fromAddress });
    console.log('Sender balance before:', formatEther(fromBalanceBefore), 'ETH');
    
    let toBalanceBefore: bigint | null = null;
    try {
      toBalanceBefore = await publicClient.getBalance({ address: toAddress });
      if (toBalanceBefore !== null) {
        console.log('Receiver balance before:', formatEther(toBalanceBefore), 'ETH');
      }
    } catch (error) {
      console.log('Could not retrieve receiver balance before transaction');
    }
    
    if (fromBalanceBefore < parseEther('0.002')) {
      console.log('Insufficient balance to send transaction');
      return;
    }
    
    // Send the transaction
    let hash: `0x${string}`;
    try {
      hash = await walletClient.sendTransaction({
        to: toAddress,
        value: parseEther('0.001'),
      });
      console.log('Transaction sent with hash:', hash);
    } catch (sendError: any) {
      console.log('Error sending transaction:', sendError.message);
      if (sendError.message.includes('nonce too low')) {
        console.log('Transaction may have already been sent with a previous call.');
        // We continue with the flow as the transaction might have actually been sent
        // The hash is not available from the error, so we'll need to skip waiting for confirmation
        throw sendError;
      } else {
        throw sendError;
      }
    }
    
    // Wait for transaction confirmation
    console.log('Waiting for transaction confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    console.log('Transaction status:', receipt.status);
    
    // Check balances after sending
    console.log('\n--- Balances After Transaction ---');
    const fromBalanceAfter: bigint = await publicClient.getBalance({ address: fromAddress });
    console.log('Sender balance after:', formatEther(fromBalanceAfter), 'ETH');
    
    try {
      const toBalanceAfter: bigint = await publicClient.getBalance({ address: toAddress });
      console.log('Receiver balance after:', formatEther(toBalanceAfter), 'ETH');
      
      // Calculate the difference
      const fromBalanceDiff = fromBalanceBefore - fromBalanceAfter;
      console.log('\n--- Balance Changes ---');
      console.log('Sender balance change:', formatEther(fromBalanceDiff), 'ETH');
      
      if (toBalanceBefore !== null) {
        const toBalanceDiff = toBalanceAfter - toBalanceBefore;
        console.log('Receiver balance change:', formatEther(toBalanceDiff), 'ETH');
      } else {
        console.log('Receiver balance change: Cannot calculate (no initial balance retrieved)');
      }
    } catch (error) {
      console.log('Could not retrieve receiver balance after transaction');
    }
    
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}