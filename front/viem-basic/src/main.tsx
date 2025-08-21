import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import our blockchain examples
// import './examples/account_net_tx_basics.ts'
// import './examples/build_raw_tx.js'
// import './examples/token_basics.ts'
// import './examples/watchTransfer.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)