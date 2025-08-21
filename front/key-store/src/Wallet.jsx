import { useState } from 'react';
import { ethers } from 'ethers';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [keystore, setKeystore] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [error, setError] = useState('');

  // Create a new wallet
  const createWallet = () => {
    try {
      console.log('Creating new wallet');
      const newWallet = ethers.Wallet.createRandom();
      console.log('New wallet created:', newWallet);
      setWallet(newWallet);
      setAddress(newWallet.address);
      setError('');
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Error creating wallet: ' + err.message);
    }
  };

  // Encrypt wallet to keystore
  const encryptKeystore = async () => {
    console.log('Encrypting wallet to keystore with password');
    if (!wallet || !password) {
      setError('Please create a wallet and enter a password');
      console.log('Missing wallet or password for encryption');
      return;
    }

    try {
      const keystoreJson = await wallet.encrypt(password);
      console.log('Wallet encrypted successfully');
      setKeystore(keystoreJson);
      setError('');
    } catch (err) {
      console.error('Error encrypting keystore:', err);
      setError('Error encrypting keystore: ' + err.message);
    }
  };

  // Decrypt keystore to wallet
  const decryptKeystore = async () => {
    console.log('Decrypting keystore with:', { keystore, password });
    if (!keystore || !password) {
      setError('Please provide keystore JSON and password');
      console.log('Missing keystore or password');
      return;
    }

    try {
      console.log('Attempting to decrypt keystore');
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(keystore, password);
      console.log('Decrypted wallet:', decryptedWallet);
      setWallet(decryptedWallet);
      setAddress(decryptedWallet.address);
      setBalance('');
      setError('');
      console.log('Successfully set wallet and address:', decryptedWallet.address);
    } catch (err) {
      console.error('Error decrypting keystore:', err);
      setError('Error decrypting keystore: ' + err.message);
    }
  };

  // Connect to Anvil provider
  const getProvider = () => {
    // Default to Anvil local network
    return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  };

  // Get balance
  const getBalance = async () => {
    if (!address) {
      setError('No wallet address available');
      return;
    }

    try {
      const provider = getProvider();
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
      setError('');
    } catch (err) {
      setError('Error fetching balance: ' + err.message);
    }
  };

  // Send transaction
  const sendTransaction = async () => {
    if (!wallet || !recipient || !amount) {
      setError('Please provide wallet, recipient address, and amount');
      return;
    }

    try {
      setTransactionStatus('Sending transaction...');
      const provider = getProvider();
      const walletWithProvider = new ethers.Wallet(wallet.privateKey, provider);
      
      const tx = await walletWithProvider.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      });
      
      setTransactionStatus(`Transaction sent! Hash: ${tx.hash}`);
      await tx.wait();
      setTransactionStatus(`Transaction confirmed! Hash: ${tx.hash}`);
      
      // Update balance after transaction
      await getBalance();
      setError('');
    } catch (err) {
      setError('Error sending transaction: ' + err.message);
      setTransactionStatus('');
    }
  };

  // Fund wallet using Anvil's built-in faucet
  const fundWallet = async () => {
    if (!address) {
      setError('No wallet address available');
      return;
    }

    try {
      setTransactionStatus('Preparing to fund wallet...');
      // Using a clearer value: 1000 ETH = 1000 * 10^18 wei = 0x3635C9ADC5DEA00000 in hex
      const valueInWei = "0x3635C9ADC5DEA00000"; // 1000 ETH in hex
      
      const topSection = `To fund this wallet with 1000 ETH, run the command below in your terminal:\n\n`;
      
      const middleSection = `curl -H "Content-Type: application/json" --data "{\\"jsonrpc\\":\\"2.0\\",\\"method\\":\\"anvil_setBalance\\",\\"params\\":[\\"${address}\\",\\"${valueInWei}\\"],\\"id\\":1}" http://127.0.0.1:8545\n\n`;
      
      const bottomSection = `This command works on Windows (cmd.exe and PowerShell), Linux, and macOS.\nAfter running this command, click "Get Balance" to verify your wallet has been funded.`;
      
      setTransactionStatus(topSection + middleSection + bottomSection);
      setError('');
    } catch (err) {
      setError('Error funding wallet: ' + err.message);
    }
  };

  // Format JSON for display
  const formatJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  return (
    <div className="wallet-container">
      <h1>KeyStore Wallet Demo</h1>
      <h2>EVM Keystore Wallet Demo</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="wallet-layout">
        {/* Left Column */}
        <div className="wallet-column">
          <div className="wallet-section">
            <h3>1. Create Wallet</h3>
            <button onClick={createWallet}>Create New Wallet</button>
            
            {(wallet || address) && (
              <div className="wallet-info">
                <p><strong>Address:</strong> {address || wallet?.address}</p>
                {wallet?.mnemonic?.phrase && <p><strong>Mnemonic:</strong> {wallet.mnemonic.phrase}</p>}
                {wallet?.privateKey && <p><strong>Private Key:</strong> {wallet.privateKey}</p>}
              </div>
            )}
          </div>

          <div className="keystore-section">
            <h3>2. Keystore Encryption/Decryption</h3>
            <div>
              <label>Password: </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password"
              />
            </div>
            
            <div>
              <button onClick={encryptKeystore}>Encrypt to Keystore</button>
              <button onClick={decryptKeystore}>Decrypt from Keystore</button>
            </div>
            
            <div>
              <h4>Keystore JSON:</h4>
              <textarea 
                value={keystore ? formatJSON(keystore) : keystore} 
                onChange={(e) => setKeystore(e.target.value)} 
                rows="15" 
                cols="50"
                placeholder={`Paste your keystore JSON here for decryption.\n\nExample:\n{"address":"...","crypto":{...},"id":"...","version":3}`}
                style={{ 
                  fontFamily: 'monospace', 
                  whiteSpace: 'pre',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="wallet-column">
          <div className="balance-section">
            <h3>3. Wallet Balance</h3>
            {address && <p><strong>Address:</strong> {address || wallet?.address}</p>}
            <button onClick={getBalance}>Get Balance</button>
            {balance && <p><strong>Balance:</strong> {balance} ETH</p>}
            <button onClick={fundWallet}>Fund Wallet (Anvil)</button>
          </div>

          <div className="transaction-section">
            <h3>4. Send Transaction</h3>
            {address && <p><strong>Address:</strong> {address || wallet?.address}</p>}
            <div>
              <label>Recipient: </label>
              <input 
                type="text" 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)} 
                placeholder="Recipient address"
              />
            </div>
            
            <div>
              <label>Amount (ETH): </label>
              <input 
                type="text" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Amount in ETH"
              />
            </div>
            
            <button onClick={sendTransaction}>Send Transaction</button>
            
            {transactionStatus && <p className="transaction-status" style={{whiteSpace: 'pre-line'}}>{transactionStatus}</p>}
          </div>
        </div>
      </div>

      <div className="instructions">
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Create New Wallet" to generate a new wallet</li>
          <li>Enter a password and click "Encrypt to Keystore" to create a keystore file</li>
          <li>Save the keystore JSON and password securely</li>
          <li>To restore, paste the keystore JSON and enter password, then click "Decrypt from Keystore"</li>
          <li>To test transactions, start Anvil with `anvil` command</li>
          <li>Use "Fund Wallet" to get test ETH on Anvil local network</li>
          <li>Send transactions to other addresses on the network</li>
        </ol>
        <h4>About Keystore:</h4>
        <p>
          A keystore is an encrypted JSON file that contains a wallet's private key. 
          It's encrypted with a password and is a safer way to store your private keys 
          compared to plain text. The keystore follows the Web3 Secret Storage standard.
        </p>
      </div>
    </div>
  );
};

export default Wallet;