import { useState, useEffect } from 'react'
import './App.css'
import { createWalletClient, custom, formatEther, getContract } from 'viem'
import { sepolia } from 'viem/chains'
import { createPublicClient, http } from 'viem'

// Define Counter contract ABI
const counterAbi =[
	{
		"inputs": [],
		"name": "increment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "number",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newNumber",
				"type": "uint256"
			}
		],
		"name": "setNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const;

// Counter contract address (example address, replace with actual address when using)
const counterContractAddress = "0x37a4a7BE204044a3B2d34CA34c70e2759A9dbf4c"

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [publicClient, setPublicClient] = useState<any>(null)

  // Initialize clients
  useEffect(() => {
    const initClients = async () => {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      })
      setPublicClient(publicClient)
    }

    initClients()
  }, [])

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum)
        })
        
        setWalletClient(walletClient)
        
        // Request account access
        const [address] = await walletClient.requestAddresses()
        setAccount(address)
        
        // Get network information
        const chain = await walletClient.getChainId()
        setChainId(chain)
        setNetwork(chain === 1 ? 'Ethereum Mainnet' : chain === 11155111 ? 'Sepolia Testnet' : `Unknown Network (${chain})`)
        
        // Get balance
        const balance = await publicClient.getBalance({ address })
        setBalance(formatEther(balance))
        
        // Get counter value
        await fetchCounterValue(publicClient)
      } catch (error) {
        console.error('Error connecting to wallet:', error)
      }
    } else {
      alert('Please install MetaMask wallet extension!')
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null)
    setNetwork(null)
    setChainId(null)
    setBalance(null)
    setCount(null)
    setWalletClient(null)
  }

  // Get counter value
  const fetchCounterValue = async (client: any) => {
    if (!client) return
    
    try {
      const contract = getContract({
        address: counterContractAddress,
        abi: counterAbi,
        client
      })
      
      const value = await (contract as any).read.number()
      setCount(Number(value))
    } catch (error) {
      console.error('Error fetching counter value:', error)
    }
  }

  // Increment counter value
  const incrementCounter = async () => {
    if (!walletClient || !account || !publicClient) return
    
    try {
      const contract = getContract({
        address: counterContractAddress,
        abi: counterAbi,
        client: walletClient
      })
      
      const tx = await (contract as any).write.increment({
        account
      })
      console.log('Transaction hash:', tx)
      
      // Wait for transaction confirmation and update counter value
      await publicClient.waitForTransactionReceipt({ hash: tx })
      await fetchCounterValue(publicClient)
    } catch (error) {
      console.error('Error incrementing counter:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold">Web3 Wallet Demo</h1>
          <p className="text-gray-200 mt-2">Built with Viem and React</p>
        </div>
        
        <div className="p-6">
          {!account ? (
            <div className="text-center">
              <button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
              >
                Connect MetaMask Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Wallet Information</h2>
                  <button 
                    onClick={disconnectWallet}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
                  >
                    Disconnect
                  </button>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Wallet Address</p>
                    <p className="font-mono text-sm break-all">{account}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Network</p>
                      <p>{network}</p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Chain ID</p>
                      <p>{chainId}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">ETH Balance</p>
                    <p>{balance} ETH</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold mb-4">Counter Contract</h2>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-gray-400">Current Value</p>
                  <p className="text-4xl font-bold my-3">{count !== null ? count : '...'}</p>
                  <button 
                    onClick={incrementCounter}
                    disabled={!walletClient}
                    className={`mt-2 w-full py-2 rounded-lg font-semibold transition ${
                      walletClient 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Increment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-900 p-4 text-center text-gray-500 text-sm">
          <p>Web3 Demo with Viem + React + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App