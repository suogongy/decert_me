import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
// Removed unused import

// WETH token contract address on anvil
const SIMPLE_ERC20TEKEN_ADDRESS = '0x8464135c8f25da09e49bc8782676a84730c318bc'

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

export async function runWethExample(rpcUrl?: string, privateKeyParam?: string, chainId?: string) {
  // Account and client setup
  const privateKey = (privateKeyParam || import.meta.env.VITE_PRIVATE_KEY) as `0x${string}`
  const account = privateKeyToAccount(privateKey)

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(rpcUrl || import.meta.env.VITE_ANVIL_RPC_URL)
  })

  const walletClient = createWalletClient({
    chain: foundry,
    transport: http(rpcUrl || import.meta.env.VITE_ANVIL_RPC_URL),
    account
  })

  // 1. Token balance query
  async function getTokenBalance() {
    try {
      console.log('Getting Custom SIMPLE ERC20Token information...')
      
      // Get token symbol
      const symbol = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol',
      })
      
      // Get token decimals
      const decimals = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })
      
      // Get account balance
      const balance = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
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
      console.log(`Transferring ${formatEther(amount)} TOKENS to ${to}...`)
      
      // Get balances before transfer
      const senderBalanceBefore = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      }) as bigint

      const recipientBalanceBefore = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [to],
      }) as bigint

      console.log(`Sender balance before transfer: ${formatEther(senderBalanceBefore)} TOKENS`)
      console.log(`Recipient balance before transfer: ${formatEther(recipientBalanceBefore)} TOKENS`)
      
      // Simulate the transaction first
      const { request } = await publicClient.simulateContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount],
        account,
      })
      
      // In a real application, you would send the transaction:
      const hash = await walletClient.writeContract(request)
      console.log('Transaction hash:', hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transfer Transaction receipt:', receipt)
      
      // Get balances after transfer
      const senderBalanceAfter = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      }) as bigint

      const recipientBalanceAfter = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [to],
      }) as bigint

      console.log(`Sender balance after transfer: ${formatEther(senderBalanceAfter)} TOKENS`)
      console.log(`Recipient balance after transfer: ${formatEther(recipientBalanceAfter)} TOKENS`)
      console.log(`Sender balance change: ${formatEther(senderBalanceBefore - senderBalanceAfter)} TOKENS`)
      console.log(`Recipient balance change: ${formatEther(recipientBalanceAfter - recipientBalanceBefore)} TOKENS`)
    } catch (error) {
      console.error('Error transferring tokens:', error)
    }
  }

  // 3. Token approval
  async function approveSpender(spender: `0x${string}`, amount: bigint) {
    try {
      console.log(`Approving ${formatEther(amount)} ERC20Token for spender ${spender}...`)
      
      // Check current allowance
      const currentAllowance = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, spender],
      }) as bigint

      if(currentAllowance > 0){
        amount += currentAllowance;
      }
      
      console.log(`Current allowance: ${formatEther(currentAllowance as bigint)} TOKENS`)
      
      // Simulate the approval transaction
      const { request } = await publicClient.simulateContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
        account,
      })
      
      // In a real application, you would send the transaction:
      const hash = await walletClient.writeContract(request)
      console.log('Approval transaction hash:', hash)

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Approval transaction successful:', receipt)

      const allowanceAfterApproved = await publicClient.readContract({
        address: SIMPLE_ERC20TEKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, spender],
      }) as bigint
      
      console.log(`after approved allowance: ${formatEther(allowanceAfterApproved as bigint)} TOKENS`)
      
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
    await transferTokens('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('3.0'))
    
    // Demonstrate approval
    await approveSpender('0x976EA74026E726554dB657fA54763abd0C3a0aa9', parseEther('5.0'))
  }

  await demonstrateERC20Operations()
}