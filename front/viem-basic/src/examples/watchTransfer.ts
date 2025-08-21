import { createPublicClient, http, formatEther, decodeEventLog } from 'viem'
import { mainnet } from 'viem/chains'
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

// Create public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL)
})

// 1. Watch ERC20 Transfer events
async function watchTransferEvents() {
  console.log('Watching for WETH Transfer events...')
  
  try {
    // Get token name
    const name = await publicClient.readContract({
      address: WETH_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'name',
    })
    console.log(`Token name: ${name}`)
  } catch (error) {
    console.log('Could not get token name, using default')
  }
  
  const unwatch = publicClient.watchContractEvent({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20_TRANSFER_EVENT_ABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      console.log('\n=== New Transfer Event ===')
      logs.forEach(log => {
        // Decode the event log to access the args
        const decodedLog = decodeEventLog({
          abi: ERC20_TRANSFER_EVENT_ABI,
          data: log.data,
          topics: log.topics,
        }) as DecodeEventLogReturnType<typeof ERC20_TRANSFER_EVENT_ABI>
        
        console.log('Block Number:', log.blockNumber)
        console.log('From:', decodedLog.args.from)
        console.log('To:', decodedLog.args.to)
        console.log('Value:', formatEther(decodedLog.args.value), 'tokens')
        console.log('Transaction Hash:', log.transactionHash)
      })
    },
  })
  
  console.log('Event listener started. Listening for Transfer events...')
  console.log('Press Ctrl+C to stop.')
  
  // For demonstration purposes, we'll stop after 30 seconds
  // In a real application, you would let this run indefinitely
  setTimeout(() => {
    console.log('Stopping event listener...')
    unwatch()
  }, 30000)
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
    pastEvents.slice(0, 5).forEach((event, index) => {
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
async function demonstrateEventWatching() {
  console.log('=== Event Watching Demo ===')
  
  // Get past events
  await getPastTransferEvents()
  
  // Watch for new events
  await watchTransferEvents()
}

demonstrateEventWatching()