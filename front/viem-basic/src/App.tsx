import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Viem Blockchain Examples</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <div className="card">
        <h2>Blockchain Examples</h2>
        <ul>
          <li><strong>Account, Network & Transaction Basics</strong> - Account creation, network configuration, and basic transactions</li>
          <li><strong>Raw Transaction Building</strong> - EIP-1559 transaction construction and sending</li>
          <li><strong>Token Operations</strong> - ERC20 token balance queries, transfers, and approvals</li>
          <li><strong>Event Watching</strong> - Listening to smart contract events in real-time</li>
        </ul>
        <p>
          Check the browser console for example outputs.
        </p>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App