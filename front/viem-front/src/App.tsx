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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Web3 Wallet Demo</h1>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {!account ? (
            <div className="card dark:card-dark text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Connect with MetaMask to explore your wallet information 
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Interact with the Counter contract
              </p>
              <button 
                onClick={connectWallet}
                className="btn btn-primary mx-auto px-6 py-3"
              >
                Connect MetaMask Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="card dark:card-dark">
                <div className="flex-between">
                  <h2 className="section-header dark:section-header-dark">Wallet Information</h2>
                  <button 
                    onClick={disconnectWallet}
                    className="btn btn-outline dark:btn-outline-dark text-sm"
                  >
                    Disconnect
                  </button>
                </div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label dark:info-label-dark">Wallet Address</div>
                    <div className="info-value font-mono text-sm">{account}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label dark:info-label-dark">Network</div>
                    <div className="info-value">{network}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label dark:info-label-dark">Chain ID</div>
                    <div className="info-value">{chainId}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label dark:info-label-dark">ETH Balance</div>
                    <div className="info-value">{balance ? `${parseFloat(balance).toFixed(6)} ETH` : 'Loading...'}</div>
                  </div>
                </div>
              </div>
              
              <div className="card dark:card-dark">
                <h2 className="section-header dark:section-header-dark mb-6">Counter Contract</h2>
                <div className="text-center">
                  <div className="info-label dark:info-label-dark mb-4">Current Value</div>
                  <div className="counter-display">{count !== null ? count : '...'}</div>
                  <button 
                    onClick={incrementCounter}
                    disabled={!walletClient}
                    className={`btn ${walletClient ? 'btn-secondary' : 'btn-outline dark:btn-outline-dark'} mt-4 px-6 py-3`}
                  >
                    {walletClient ? 'Increment Counter' : 'Connecting...'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          <p>Web3 Demo with Viem + React + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App