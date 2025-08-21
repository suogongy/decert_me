import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Wallet from './Wallet.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Wallet />
  </StrictMode>,
)