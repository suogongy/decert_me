import { createPublicClient, createWalletClient, custom, formatEther, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, TOKEN_BANK_ABI, TOKEN_ABI } from './config';

// Create public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: custom(window.ethereum)
});

// Create wallet client for write operations
export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum)
});

/**
 * Get ETH balance
 */
export const getEthBalance = async (address) => {
  try {
    const balance = await publicClient.getBalance({ address });
    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    throw error;
  }
};

/**
 * Get token balance
 */
export const getTokenBalance = async (address) => {
  try {
    if (!CONTRACT_ADDRESSES.sepolia.token) {
      throw new Error('Token contract address not set');
    }

    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.sepolia.token,
      abi: TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address]
    });

    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

/**
 * Get deposit balance
 */
export const getDepositBalance = async (address) => {
  try {
    if (!CONTRACT_ADDRESSES.sepolia.tokenBank) {
      throw new Error('TokenBank contract address not set');
    }

    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.sepolia.tokenBank,
      abi: TOKEN_BANK_ABI,
      functionName: 'deposits',
      args: [address]
    });

    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching deposit balance:', error);
    throw error;
  }
};

/**
 * Approve token spending
 */
export const approveTokens = async (owner, amount) => {
  try {
    if (!CONTRACT_ADDRESSES.sepolia.token) {
      throw new Error('Token contract address not set');
    }

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.sepolia.token,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.sepolia.tokenBank, parseEther(amount)],
      account: owner
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
};

/**
 * Deposit tokens with timeout
 */
export const depositTokens = async (owner, amount) => {
  try {
    if (!CONTRACT_ADDRESSES.sepolia.tokenBank) {
      throw new Error('TokenBank contract address not set');
    }

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.sepolia.tokenBank,
      abi: TOKEN_BANK_ABI,
      functionName: 'deposit',
      args: [parseEther(amount)],
      account: owner
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error depositing tokens:', error);
    throw error;
  }
};

/**
 * Withdraw tokens with timeout
 */
export const withdrawTokens = async (owner, amount) => {
  try {
    if (!CONTRACT_ADDRESSES.sepolia.tokenBank) {
      throw new Error('TokenBank contract address not set');
    }

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.sepolia.tokenBank,
      abi: TOKEN_BANK_ABI,
      functionName: 'withdraw',
      args: [parseEther(amount)],
      account: owner
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error withdrawing tokens:', error);
    throw error;
  }
};

/**
 * Wait for transaction with timeout
 */
export const waitForTransaction = async (hash, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Transaction confirmation timed out after ${timeout}ms. Transaction may still complete, please check your wallet or Etherscan.`));
    }, timeout);

    // Wait for transaction
    publicClient.waitForTransactionReceipt({ hash })
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};