'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useReadContract, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Counter_ABI } from './CounterABI';
import { useEffect, useState } from 'react';

// 这是一个示例合约地址，实际使用时需要替换为真实部署的合约地址
const COUNTER_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  const { 
    data: counterNumber, 
    refetch: refetchCounter,
    isLoading: isCounterLoading,
    isError: isCounterError
  } = useReadContract({
    address: COUNTER_ADDRESS as `0x${string}`,
    abi: Counter_ABI,
    functionName: 'number',
  });

  const { 
    writeContract,
    isPending: isWritePending,
    data: hash,
    isSuccess,
    isError: isWriteError,
    error: writeError
  } = useWriteContract();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetchCounter();
    }
  }, [isSuccess, refetchCounter]);

  const handleIncrement = async () => {
    try {
      await writeContract({
        address: COUNTER_ADDRESS as `0x${string}`,
        abi: Counter_ABI,
        functionName: 'increment',
      });
    } catch (err) {
      console.error('Error calling increment:', err);
    }
  };

  const handleSetNumber = async () => {
    const newNumber = prompt('Enter new number:');
    if (newNumber === null) return;

    try {
      const num = parseInt(newNumber);
      if (isNaN(num)) {
        alert('Please enter a valid number');
        return;
      }

      await writeContract({
        address: COUNTER_ADDRESS as `0x${string}`,
        abi: Counter_ABI,
        functionName: 'setNumber',
        args: [BigInt(num)],
      });
    } catch (err) {
      console.error('Error calling setNumber:', err);
    }
  };

  if (!isMounted) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-4 w-full max-w-md">
            <h1 className="text-3xl font-bold">Ethereum Counter DApp</h1>
            <div>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h1 className="text-3xl font-bold">Ethereum Counter DApp</h1>
          
          {!isConnected ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl">Connect your wallet</h2>
              <div className="flex flex-col gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {connector.name}
                    {isPending && ' (connecting...)'}
                  </button>
                ))}
              </div>
              {error && <div className="text-red-500">Error: {error.message}</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl">Connected Wallet</h2>
                  <p className="text-sm break-all">{address}</p>
                  {chain && <p className="text-sm">Network: {chain.name} ({chain.id})</p>}
                  {balance && (
                    <p className="text-sm">Balance: {balance.formatted} {balance.symbol}</p>
                  )}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Disconnect
                </button>
              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">
                <h2 className="text-xl">Counter Contract</h2>
                
                {isCounterLoading ? (
                  <p>Loading counter value...</p>
                ) : isCounterError ? (
                  <p>Error loading counter value</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-lg">Current Value: {counterNumber?.toString()}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleIncrement}
                        disabled={isWritePending}
                        className={`${
                          isWritePending ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-700'
                        } text-white font-bold py-2 px-4 rounded`}
                      >
                        {isWritePending ? 'Processing...' : 'Increment'}
                      </button>
                      <button
                        onClick={handleSetNumber}
                        disabled={isWritePending}
                        className={`${
                          isWritePending ? 'bg-gray-500' : 'bg-purple-500 hover:bg-purple-700'
                        } text-white font-bold py-2 px-4 rounded`}
                      >
                        Set Number
                      </button>
                    </div>
                  </div>
                )}

                {isSuccess && (
                  <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                    <p>Transaction successful!</p>
                    <p className="text-sm break-all">Hash: {hash}</p>
                  </div>
                )}

                {isWriteError && (
                  <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
                    <p>Error with transaction: {writeError?.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}