import { useState, useEffect } from 'react';
import { 
  getEthBalance, 
  getTokenBalance, 
  getDepositBalance, 
  approveTokens, 
  depositTokens, 
  withdrawTokens,
  waitForTransaction,
  publicClient
} from './contracts/contractService';
import { CONTRACT_ADDRESSES } from './contracts/config';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balances, setBalances] = useState({
    eth: '0',
    token: '0',
    deposit: '0'
  });
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(true);
  const [accounts, setAccounts] = useState([]);

  // Check if MetaMask is installed and accounts are connected
  useEffect(() => {
    // Check if device is mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Check if MetaMask is available
    const metaMaskAvailable = typeof window.ethereum !== 'undefined';
    setIsMetaMaskAvailable(metaMaskAvailable);
    
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Get accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccounts(accounts);
            setAccount(accounts[0]);
          }
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
          
          // If we have an account, update balances
          if (accounts.length > 0) {
            await updateBalances(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccounts(accounts);
          setAccount(accounts[0]);
          updateBalances(accounts[0]);
        } else {
          // When accounts are disconnected from wallet side
          setAccount(null);
          setAccounts([]);
          setChainId(null);
          setBalances({ eth: '0', token: '0', deposit: '0' });
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(chainId);
        if (account) {
          updateBalances(account);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install it to use this DApp.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setAccounts(accounts);
      setAccount(accounts[0]);
      
      // Check network and switch if needed
      await checkAndSwitchNetwork();
      
      // Update balances after connection
      await updateBalances(accounts[0]);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet function - improved version
  const disconnectWallet = async () => {
    try {
      // Reset all state
      setAccount(null);
      setAccounts([]);
      setChainId(null);
      setBalances({
        eth: '0',
        token: '0',
        deposit: '0'
      });
      setAmount('');
      setError('');
      setSuccess('');
      setTxHash('');
    } catch (err) {
      setError('Failed to disconnect wallet: ' + err.message);
    }
  };

  // Switch account function
  const switchAccount = async (newAccount) => {
    try {
      setAccount(newAccount);
      await updateBalances(newAccount);
    } catch (err) {
      setError('Failed to switch account: ' + err.message);
    }
  };

  // Check and switch to Sepolia network if needed
  const checkAndSwitchNetwork = async () => {
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
      
      // Sepolia network chain ID
      const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
      
      if (currentChainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }],
              });
            } catch (addError) {
              setError('Failed to add Sepolia network: ' + addError.message);
            }
          } else {
            setError('Failed to switch to Sepolia network: ' + switchError.message);
          }
        }
      }
    } catch (err) {
      setError('Error checking network: ' + err.message);
    }
  };

  // Update all balances
  const updateBalances = async (userAccount = account) => {
    if (!userAccount) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Check chain ID before updating balances
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
      
      // Sepolia network chain ID
      const sepoliaChainId = '0xaa36a7';
      
      if (currentChainId !== sepoliaChainId) {
        setError('Please switch to the Sepolia Test Network to view balances');
        setBalances({ eth: '0', token: '0', deposit: '0' });
        return;
      }
      
      const [ethBalance, tokenBalance, depositBalance] = await Promise.all([
        getEthBalance(userAccount),
        getTokenBalance(userAccount),
        getDepositBalance(userAccount)
      ]);
      
      setBalances({
        eth: ethBalance,
        token: tokenBalance,
        deposit: depositBalance
      });
      
      setSuccess('Balances updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating balances:', err);
      setError('Failed to update balances: ' + err.message);
      // Reset balances on error
      setBalances({ eth: '0', token: '0', deposit: '0' });
    } finally {
      setLoading(false);
    }
  };

  // Handle token deposit
  const handleDeposit = async () => {
    if (!account || !amount) {
      setError('Please connect wallet and enter amount');
      return;
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    let approveTxHash = null;
    let depositTxHash = null;
    
    try {
      setLoading(true);
      setError('');
      setTxHash('');
      
      // Check network first
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const sepoliaChainId = '0xaa36a7';
      
      if (currentChainId !== sepoliaChainId) {
        setError('Please switch to the Sepolia Test Network to make transactions');
        setLoading(false);
        return;
      }
      
      // Step 1: Approve token spending
      setSuccess('Step 1: Approving token spending...');
      const approveHash = await approveTokens(account, amount);
      approveTxHash = approveHash;
      setTxHash(approveHash);
      
      // Wait for approval transaction confirmation with timeout
      try {
        await waitForTransaction(approveHash, 30000); // 30 second timeout
        setSuccess('Approval confirmed. Proceeding with deposit...');
      } catch (approvalError) {
        throw new Error(`Approval failed: ${approvalError.message}`);
      }
      
      // Step 2: Deposit tokens
      setSuccess('Step 2: Depositing tokens...');
      const depositHash = await depositTokens(account, amount);
      depositTxHash = depositHash;
      setTxHash(depositHash);
      
      // Wait for deposit transaction confirmation with timeout
      try {
        await waitForTransaction(depositHash, 30000); // 30 second timeout
        setSuccess(`Deposit successful! Transaction: ${depositHash}`);
      } catch (depositError) {
        // Handle the case where approve succeeded but deposit failed
        const errorMessage = `Deposit confirmation failed: ${depositError.message}. 
        IMPORTANT: Your tokens have been approved for spending but the deposit was not completed. 
        You may want to check your token balance and allowance on Etherscan. 
        Transaction Hashes - Approval: ${approveTxHash} | Deposit: ${depositTxHash || 'N/A'}`;
        throw new Error(errorMessage);
      }
      
      setAmount('');
      
      // Update balances after transaction
      setTimeout(() => updateBalances(), 2000);
    } catch (err) {
      console.error('Deposit error:', err);
      setError('Deposit failed: ' + (err.shortMessage || err.message));
      
      // Provide specific guidance if approve succeeded but deposit failed
      if (approveTxHash && !depositTxHash) {
        setSuccess(`Approval successful (Transaction: ${approveTxHash}). 
        Please check Etherscan for more details. 
        Your tokens are approved for spending but not yet deposited.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle token withdrawal
  const handleWithdraw = async () => {
    if (!account || !amount) {
      setError('Please connect wallet and enter amount');
      return;
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setTxHash('');
      
      // Check network first
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const sepoliaChainId = '0xaa36a7';
      
      if (currentChainId !== sepoliaChainId) {
        setError('Please switch to the Sepolia Test Network to make transactions');
        setLoading(false);
        return;
      }
      
      // Withdraw tokens
      setSuccess('Withdrawing tokens...');
      const withdrawHash = await withdrawTokens(account, amount);
      setTxHash(withdrawHash);
      
      // Wait for transaction confirmation with timeout
      try {
        await waitForTransaction(withdrawHash, 30000); // 30 second timeout
        setSuccess(`Withdrawal successful! Transaction: ${withdrawHash}`);
      } catch (withdrawError) {
        throw new Error(`Withdrawal confirmation failed: ${withdrawError.message}`);
      }
      
      setAmount('');
      
      // Update balances after transaction
      setTimeout(() => updateBalances(), 2000);
    } catch (err) {
      console.error('Withdraw error:', err);
      setError('Withdrawal failed: ' + (err.shortMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Show mobile warning if needed
  if (isMobile && !isMetaMaskAvailable) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>TokenBank DApp</h1>
        </header>
        <main className="app-main">
          <div className="warning-message">
            <h2>Mobile Device Detected</h2>
            <p>
              This DApp requires a wallet browser such as MetaMask to function properly.
              Please open this application in a wallet-enabled browser like MetaMask Mobile.
            </p>
            <p>
              Alternatively, you can access this DApp from a desktop computer with MetaMask installed.
            </p>
          </div>
        </main>
        <footer className="app-footer">
          <p>TokenBank DApp - Secure Token Banking on Ethereum</p>
        </footer>
      </div>
    );
  }

  // Get network name based on chain ID
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0xaa36a7':
        return 'Sepolia Test Network';
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x89':
        return 'Polygon';
      default:
        return 'Unknown Network';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TokenBank DApp</h1>
        {!account && (
          <button 
            onClick={connectWallet} 
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {txHash && (
        <div className="info-message">
          Transaction: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
          <br />
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {account && (
        <div className="network-info-section">
          <h2>Network Information</h2>
          <div className="network-info">
            <div className="info-item">
              <span>Current Network:</span>
              <span>{getNetworkName(chainId)} ({chainId})</span>
            </div>
            <div className="info-item">
              <span>Status:</span>
              <span className={chainId === '0xaa36a7' ? 'status-connected' : 'status-error'}>
                {chainId === '0xaa36a7' ? 'Connected' : 'Wrong Network'}
              </span>
            </div>
          </div>
          <div className="network-actions">
            {chainId !== '0xaa36a7' && (
              <button onClick={checkAndSwitchNetwork} className="switch-network-button">
                Switch to Sepolia
              </button>
            )}
            <button onClick={disconnectWallet} className="disconnect-button">
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
      
      {/* Show full account address when hovering over the account info */}
      {account && (
        <style jsx>{`
          .full-address {
            font-family: monospace;
            word-break: break-all;
            cursor: pointer;
          }
          
          .full-address:hover::after {
            content: attr(title);
            position: absolute;
            background: #333;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            white-space: nowrap;
            z-index: 1;
            bottom: 120%;
            left: 50%;
            margin-left: -40px;
            font-size: 12px;
          }
        `}</style>
      )}

      {account && (
        <div className="account-info-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="info-item">
              <span>Current Account:</span>
              <span className="account-address">{account}</span>
            </div>
            {accounts.length > 1 && (
              <div className="info-item">
                <span>Switch Account:</span>
                <select 
                  value={account} 
                  onChange={(e) => switchAccount(e.target.value)}
                  className="account-selector"
                >
                  {accounts.map((acc, index) => (
                    <option key={index} value={acc}>
                      {acc.substring(0, 6)}...{acc.substring(acc.length - 4)} {index === 0 ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="info-item">
              <span>Token Contract:</span>
              <span className="contract-address">{CONTRACT_ADDRESSES.sepolia.token}</span>
            </div>
            <div className="info-item">
              <span>Bank Contract:</span>
              <span className="contract-address">{CONTRACT_ADDRESSES.sepolia.tokenBank}</span>
            </div>
          </div>
        </div>
      )}

      {account && chainId === '0xaa36a7' && (
        <main className="app-main">
          <div className="balances-section">
            <h2>Your Balances</h2>
            <div className="balance-item">
              <span>ETH Balance:</span>
              <span>{parseFloat(balances.eth).toFixed(4)} ETH</span>
            </div>
            <div className="balance-item">
              <span>Token Balance:</span>
              <span>{parseFloat(balances.token).toFixed(2)} TOKEN</span>
            </div>
            <div className="balance-item">
              <span>Deposit Balance:</span>
              <span>{parseFloat(balances.deposit).toFixed(2)} TOKEN</span>
            </div>
            <button onClick={() => updateBalances()} disabled={loading}>
              {loading ? 'Updating...' : 'Refresh Balances'}
            </button>
          </div>

          <div className="transaction-section">
            <h2>Transactions</h2>
            <div className="amount-input">
              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="any"
              />
            </div>
            <div className="transaction-buttons">
              <button 
                onClick={handleDeposit} 
                disabled={loading}
                className="deposit-button"
              >
                {loading ? 'Processing...' : 'Deposit'}
              </button>
              <button 
                onClick={handleWithdraw} 
                disabled={loading}
                className="withdraw-button"
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </main>
      )}

      {account && chainId !== '0xaa36a7' && (
        <div className="network-warning">
          <p>Please switch to the Sepolia Test Network to use this DApp.</p>
          <button onClick={checkAndSwitchNetwork}>Switch to Sepolia</button>
        </div>
      )}

      <footer className="app-footer">
        <p>TokenBank DApp - Secure Token Banking on Ethereum</p>
      </footer>
    </div>
  );
}

export default App;