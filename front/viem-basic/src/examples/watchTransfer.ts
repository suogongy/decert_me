import { createPublicClient, http, formatEther, decodeEventLog } from 'viem'
import { foundry } from 'viem/chains'
import type { DecodeEventLogReturnType } from 'viem'

// WETH token contract address on Ethereum mainnet
const WETH_ADDRESS = '0x8464135c8f25da09e49bc8782676a84730c318bc'

// ERC20 Transfer event ABI
const ERC20_TRANSFER_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const

// ERC20 ABI for name function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const

// Updated to accept parameters for interactive mode
export async function runWatchTransfer(rpcUrl?: string, chainId?: string) {
  console.log('=== Event Watching Demo ===')
  
  // Determine chain based on chainId

  if(chainId === undefined){
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

  console.log('Chain:', publicClient.chain.name)
  console.log('RPC URL:', finalRpcUrl)
  
  // 1. Watch ERC20 Transfer events
  async function watchTransferEvents() {
    console.log('\n=== Watching Transfer Events ===')
    console.log('Watching for new Transfer events (press Ctrl+C to stop)...')
    
    // Create a persistent Set to track processed logs across multiple calls
    const processedLogs = new Set<string>()
    
    try {
      const unwatch = publicClient.watchContractEvent({
        address: WETH_ADDRESS as `0x${string}`,
        abi: ERC20_TRANSFER_EVENT_ABI,
        eventName: 'Transfer',
        onLogs: (logs: any[]) => {
          console.log(`\n--- New Transfer Event ---`)
          logs.forEach((log: any) => {
            try {
              // Create a unique identifier for the log
              const logId = `${log.blockNumber}-${log.transactionHash}-${log.logIndex}`
              
              console.log('logId is:', logId)
              
              // Skip if we've already processed this log
              if (processedLogs.has(logId)) {
                console.log('Skipping duplicate log:', logId)
                return
              }
              
              // Mark this log as processed
              processedLogs.add(logId)
              
              const decodedLog = decodeEventLog({
                abi: ERC20_TRANSFER_EVENT_ABI,
                data: log.data,
                topics: log.topics,
              }) as DecodeEventLogReturnType<typeof ERC20_TRANSFER_EVENT_ABI, 'Transfer'>
              
              console.log('Address:', log.address)
              console.log('Block Number:', log.blockNumber)
              console.log('From:', decodedLog.args.from)
              console.log('To:', decodedLog.args.to)
              console.log('Value:', formatEther(decodedLog.args.value ?? 0n), 'tokens')
            } catch (decodeError) {
              console.error('Error decoding log:', decodeError)
            }
          })
        },
      })
      
      // Return the unwatch function so it can be called to stop watching
      return unwatch
    } catch (error) {
      console.error('Error watching events:', error)
    }
  }

  // 2. Get past Transfer events
  async function getPastTransferEvents() {
    console.log('\n=== Getting Past Transfer Events ===')
    
    try {
      const pastEvents = await publicClient.getContractEvents({
        address: WETH_ADDRESS as `0x${string}`,
        abi: ERC20_TRANSFER_EVENT_ABI,
        eventName: 'Transfer',
        fromBlock: 1n,
        toBlock: 'latest',
      })
      
      console.log(`Found ${pastEvents.length} past Transfer events:`)
      
      // Display the first 5 events
      pastEvents.slice(0, 10).forEach((event, index) => {
        console.log(`\n--- Event ${index + 1} ---`)
        console.log('Block Number:', event.blockNumber)
        console.log('From:', event.args.from)
        console.log('To:', event.args.to)
        console.log('Value:', formatEther(event.args.value ?? 0n), 'tokens')
      })
    } catch (error) {
      console.error('Error getting past events:', error)
    }
  }

  // Demonstrate event watching functionality
  console.log('=== Event Watching Demo ===')
  
  // Get past events
  await getPastTransferEvents()
  
  // Watch for new events
  const unwatch = await watchTransferEvents()
  
  // Keep the process running for 60 seconds to listen for events
  // In a real application, you might want to let this run indefinitely
  setTimeout(() => {
    if (unwatch) {
      console.log('Stopping event listener...')
      unwatch()
    }
  }, 60000)
}