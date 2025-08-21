import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [rpcUrl, setRpcUrl] = useState(() => import.meta.env.VITE_ANVIL_RPC_URL || '')
  const [privateKey, setPrivateKey] = useState(() => import.meta.env.VITE_PRIVATE_KEY || '')
  const [chainId, setChainId] = useState(() => import.meta.env.VITE_ANVIL_CHAIN || '1')

  //add default value of rpcUrl, privateKey and chainId from .env
  useEffect(() => {
    if (!rpcUrl) {
      setRpcUrl(import.meta.env.VITE_ANVIL_RPC_URL || '')
    }
    if (!privateKey) {
      setPrivateKey(import.meta.env.VITE_PRIVATE_KEY || '')
    }
    if (!chainId) {
      setChainId(import.meta.env.VITE_ANVIL_CHAIN || '1')
    }
  }, [])

  const runExample = async (exampleName: string) => {
    setActiveExample(exampleName)
    
    try {
      console.log('Calling example with parameters - rpcUrl:', rpcUrl, 'privateKey: [HIDDEN]', 'chainId:', chainId)
      
      // Dynamically import and run the selected example
      if (exampleName === 'account_net_tx_basics') {
        const { runAccountBasics } = await import('./examples/account_net_tx_basics.ts')
        await runAccountBasics(rpcUrl || undefined, privateKey || undefined, chainId)
      } else if (exampleName === 'token_basics') {
        const { runTokenBasics } = await import('./examples/token_basics.ts')
        await runTokenBasics(rpcUrl || undefined, privateKey || undefined, chainId)
      } else if (exampleName === 'build_raw_tx') {
        const { runBuildRawTx } = await import('./examples/build_raw_tx.ts')
        await runBuildRawTx(rpcUrl || undefined, privateKey || undefined, chainId)
      } else if (exampleName === 'watchTransfer') {
        const { runWatchTransfer } = await import('./examples/watchTransfer.ts')
        await runWatchTransfer(rpcUrl || undefined, chainId)
      } else if (exampleName === 'basic_example') {
        const { runBasicExample } = await import('./examples/index.ts')
        await runBasicExample(rpcUrl || undefined, privateKey || undefined, chainId)
      } else if (exampleName === 'simple_erc20_token') {
        const { runWethExample } = await import('./examples/simple_erc20_token.ts')
        await runWethExample(rpcUrl || undefined, privateKey || undefined, chainId)
      }
    } catch (err) {
      console.error(`Error running example ${exampleName}:`, err)
    }
  }

  return (
    <>
      <h1>Viem Blockchain Examples</h1>
      
      <div className="card interactive-card">
        <h2>Interactive Blockchain Examples</h2>
        <div className="interactive-layout">
          <div className="config-panel">
            <div className="config-section">
              <h3>Configuration</h3>
              <div className="input-group">
                <label>RPC URL:</label>
                <input 
                  type="text" 
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                  placeholder="Enter RPC URL (e.g., https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY)"
                />
              </div>
              <div className="input-group">
                <label>Private Key:</label>
                <input 
                  type="password" 
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter private key (0x...)"
                />
              </div>
              <div className="input-group">
                <label>Chain ID:</label>
                <input 
                  type="text" 
                  value={chainId}
                  onChange={(e) => setChainId(e.target.value)}
                  placeholder="Enter chain ID (e.g., 1 for Mainnet, 31337 for Anvil)"
                />
              </div>
            </div>
          </div>
          
          <div className="examples-panel">
            <div className="examples-section">
              <h3>Examples</h3>
              <ul>
                <li>
                  <button onClick={() => runExample('basic_example')}>
                    Basic Account & Network Operations
                  </button>
                  <p>Account creation, network configuration, and basic operations from index.ts</p>
                </li>
                <li>
                  <button onClick={() => runExample('simple_erc20_token')}>
                    ERC20 Token Operations
                  </button>
                  <p>ERC20 token operations from simple_erc20_token.ts</p>
                </li>
                <li>
                  <button onClick={() => runExample('account_net_tx_basics')}>
                    Account, Network & Transaction Basics
                  </button>
                  <p>Account creation, network configuration, and basic transactions</p>
                </li>
                <li>
                  <button onClick={() => runExample('token_basics')}>
                    Token Operations
                  </button>
                  <p>Complete ERC20 token operations with contract deployment</p>
                </li>
                <li>
                  <button onClick={() => runExample('build_raw_tx')}>
                    Raw Transaction Building
                  </button>
                  <p>Manual EIP-1559 transaction construction and sending</p>
                </li>
                <li>
                  <button onClick={() => runExample('watchTransfer')}>
                    Event Watching
                  </button>
                  <p>Listen to ERC20 Transfer events in real-time</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App