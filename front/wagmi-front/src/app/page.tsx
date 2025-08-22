'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { NFTMarket_ABI } from './NFTMarketABI';
import { NFT_ABI } from './NFTABI';
import { useEffect, useState } from 'react';

// 合约地址 - 需要替换为实际部署的地址
// 当前使用的地址:
// NFT市场合约地址: 0xde9528D55D6651ab4C63E6a0f6C22B58f12fa481
// NFT合约地址: 0xAC5C6Ec5bBC4531A3356621f675D24F612BDbE28
const NFT_MARKET_ADDRESS = '0xde9528D55D6651ab4C63E6a0f6C22B58f12fa481';
const NFT_ADDRESS = '0xAC5C6Ec5bBC4531A3356621f675D24F612BDbE28';

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  // 获取用户NFT余额
  const { 
    data: nftBalance,
    refetch: refetchNftBalance
  } = useReadContract({
    address: NFT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  });

  // 获取下一个列表ID
  const { 
    data: nextListingId,
    refetch: refetchNextListingId
  } = useReadContract({
    address: NFT_MARKET_ADDRESS as `0x${string}`,
    abi: NFTMarket_ABI,
    functionName: 'nextListingId',
  });

  // 获取特定列表信息
  const [listingIdToView, setListingIdToView] = useState<string>(''); // 移除默认值
  const { 
    data: listingInfo,
    refetch: refetchListingInfo,
    error: listingInfoError
  } = useReadContract({
    address: NFT_MARKET_ADDRESS as `0x${string}`,
    abi: NFTMarket_ABI,
    functionName: 'listings',
    args: [BigInt(listingIdToView || 0)] 
  });

  const { 
    writeContract,
    isPending: isWritePending,
    data: hash,
    isSuccess,
    isError: isWriteError,
    error: writeError
  } = useWriteContract();

  // 监听合约事件
  useWatchContractEvent({
    address: NFT_MARKET_ADDRESS as `0x${string}`,
    abi: NFTMarket_ABI,
    eventName: 'NFTListed',
    onLogs(logs: any[]) {
      console.log('NFT Listed:', logs);
      refetchNextListingId();
      refetchListingInfo();
      refetchNftBalance();
    },
  });

  useWatchContractEvent({
    address: NFT_MARKET_ADDRESS as `0x${string}`,
    abi: NFTMarket_ABI,
    eventName: 'NFTPurchased',
    onLogs(logs: any[]) {
      console.log('NFT Purchased:', logs);
      refetchNextListingId();
      refetchListingInfo();
      refetchNftBalance();
    },
  });

  useWatchContractEvent({
    address: NFT_MARKET_ADDRESS as `0x${string}`,
    abi: NFTMarket_ABI,
    eventName: 'NFTDelisted',
    onLogs(logs: any[]) {
      console.log('NFT Delisted:', logs);
      refetchNextListingId();
      refetchListingInfo();
      refetchNftBalance();
    },
  });

  const [isMounted, setIsMounted] = useState(false);
  // NFT铸造状态
  const [tokenIdToMint, setTokenIdToMint] = useState<string>('');
  // 授权和上架状态
  const [tokenIdToApprove, setTokenIdToApprove] = useState<string>('');
  const [tokenIdToList, setTokenIdToList] = useState<string>('');
  const [priceToList, setPriceToList] = useState<string>('');
  // 购买和下架状态
  const [listingIdToManage, setListingIdToManage] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetchNextListingId();
      refetchListingInfo();
      refetchNftBalance();
    }
  }, [isSuccess, refetchNextListingId, refetchListingInfo, refetchNftBalance]);

  // 铸造NFT
  const handleMintNFT = async () => {
    try {
      if (!tokenIdToMint) {
        alert('Please enter a Token ID');
        return;
      }
      
      await writeContract({
        address: NFT_ADDRESS as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [address as `0x${string}`, BigInt(tokenIdToMint)]
      });
    } catch (err) {
      console.error('Error minting NFT:', err);
    }
  };

  // 授权NFT给市场合约
  const handleApproveNFT = async () => {
    try {
      if (!tokenIdToApprove) {
        alert('Please enter a Token ID');
        return;
      }
      
      await writeContract({
        address: NFT_ADDRESS as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [NFT_MARKET_ADDRESS as `0x${string}`, BigInt(tokenIdToApprove)]
      });
    } catch (err) {
      console.error('Error approving NFT:', err);
    }
  };

  // 上架NFT
  const handleListNFT = async () => {
    try {
      if (!tokenIdToList || !priceToList) {
        alert('Please enter Token ID and price');
        return;
      }
      
      await writeContract({
        address: NFT_MARKET_ADDRESS as `0x${string}`,
        abi: NFTMarket_ABI,
        functionName: 'listNFT',
        args: [
          NFT_ADDRESS as `0x${string}`,
          BigInt(tokenIdToList),
          BigInt(priceToList)
        ]
      });
    } catch (err) {
      console.error('Error listing NFT:', err);
    }
  };

  // 购买NFT
  const handleBuyNFT = async () => {
    try {
      if (!listingIdToManage) {
        alert('Please enter a Listing ID');
        return;
      }
      
      if (!listingInfo || !listingInfo[2]) {
        alert('Invalid listing or price');
        return;
      }

      await writeContract({
        address: NFT_MARKET_ADDRESS as `0x${string}`,
        abi: NFTMarket_ABI,
        functionName: 'buyNFT',
        args: [BigInt(listingIdToManage)],
        value: listingInfo[2] // price
      });
    } catch (err) {
      console.error('Error buying NFT:', err);
    }
  };

  // 下架NFT
  const handleDelistNFT = async () => {
    try {
      if (!listingIdToManage) {
        alert('Please enter a Listing ID');
        return;
      }
      
      await writeContract({
        address: NFT_MARKET_ADDRESS as `0x${string}`,
        abi: NFTMarket_ABI,
        functionName: 'delistNFT',
        args: [BigInt(listingIdToManage)]
      });
    } catch (err) {
      console.error('Error delisting NFT:', err);
    }
  };

  if (!isMounted) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-4 w-full max-w-md">
            <h1 className="text-3xl font-bold">NFT Market DApp</h1>
            <div>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">NFT Market DApp</h1>
        
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connect your wallet</h2>
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
            {error && <div className="text-red-500 mt-2">Error: {error.message}</div>}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 钱包信息 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Connected Wallet</h2>
                  <p className="text-sm break-all">{address}</p>
                  {chain && <p className="text-sm">Network: {chain.name} ({chain.id})</p>}
                  {balance && (
                    <p className="text-sm">Balance: {balance.formatted} {balance.symbol}</p>
                  )}
                  {nftBalance !== undefined && (
                    <p className="text-sm">Your NFTs: {nftBalance.toString()}</p>
                  )}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* 主要操作区域 - 两列布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左列 - NFT铸造和上架 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">NFT Operations</h2>
                
                {/* 铸造NFT */}
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-bold mb-2">Mint NFT</h3>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Token ID to mint"
                      value={tokenIdToMint}
                      onChange={(e) => setTokenIdToMint(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={handleMintNFT}
                      disabled={isWritePending}
                      className={`${
                        isWritePending ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-700'
                      } text-white font-bold py-2 px-4 rounded`}
                    >
                      {isWritePending ? 'Minting...' : 'Mint NFT'}
                    </button>
                  </div>
                </div>

                {/* 授权NFT */}
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-bold mb-2">Approve NFT for Market</h3>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Token ID to approve"
                      value={tokenIdToApprove}
                      onChange={(e) => setTokenIdToApprove(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={handleApproveNFT}
                      disabled={isWritePending}
                      className={`${
                        isWritePending ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'
                      } text-white font-bold py-2 px-4 rounded`}
                    >
                      {isWritePending ? 'Approving...' : 'Approve NFT'}
                    </button>
                  </div>
                </div>

                {/* 上架NFT */}
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-bold mb-2">List NFT</h3>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Token ID to list"
                      value={tokenIdToList}
                      onChange={(e) => setTokenIdToList(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Price (wei)"
                      value={priceToList}
                      onChange={(e) => setPriceToList(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={handleListNFT}
                      disabled={isWritePending}
                      className={`${
                        isWritePending ? 'bg-gray-500' : 'bg-purple-500 hover:bg-purple-700'
                      } text-white font-bold py-2 px-4 rounded`}
                    >
                      {isWritePending ? 'Listing...' : 'List NFT'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 右列 - 查看列表和购买/下架 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Market Operations</h2>
                
                {/* 查看NFT列表信息 */}
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-bold mb-2">View Listing</h3>
                  <div className="text-xs text-gray-600 mb-2">
                    <p>Market Contract: {NFT_MARKET_ADDRESS}</p>
                    <p>NFT Contract: {NFT_ADDRESS}</p>
                    <p>Network: {chain?.name} ({chain?.id})</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Listing ID"
                      value={listingIdToView}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 允许输入非负整数（包括0）
                        if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)) && Number.isInteger(Number(value)))) {
                          setListingIdToView(value);
                        }
                      }}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={() => {
                        console.log('Refetching listing info for ID:', listingIdToView);
                        if (listingIdToView === '' || isNaN(Number(listingIdToView))) {
                          alert('Please enter a valid listing ID');
                          return;
                        }
                        refetchListingInfo();
                      }}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Get Listing Info
                    </button>
                    
                    {listingInfoError && (
                      <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                        <p>Error: {listingInfoError.message}</p>
                        <p className="mt-2">
                          This error may occur if:
                          <ul className="list-disc pl-5 mt-1">
                            <li>The contract is not deployed at the specified address</li>
                            <li>The listing ID does not exist</li>
                            <li>The contract address is incorrect</li>
                            <li>You're connected to the wrong network</li>
                          </ul>
                        </p>
                        <p className="mt-2">
                          Current network: {chain?.name} ({chain?.id})<br/>
                          Expected network: Sepolia (11155111)
                        </p>
                      </div>
                    )}
                    
                    {listingInfo && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm">Token ID: {listingInfo[0]?.toString()}</p>
                        <p className="text-sm">Token Address: {listingInfo[1]}</p>
                        <p className="text-sm">Price: {listingInfo[2]?.toString()} wei</p>
                        <p className="text-sm">Seller: {listingInfo[3]}</p>
                        <p className="text-sm">Status: {listingInfo[4] ? 'Active' : 'Inactive'}</p>
                      </div>
                    )}
                    
                    {!listingInfo && !listingInfoError && (
                      <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                        <p>Enter a listing ID and click "Get Listing Info" to view details.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 购买/下架NFT */}
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-bold mb-2">Manage NFT</h3>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Listing ID"
                      value={listingIdToManage}
                      onChange={(e) => setListingIdToManage(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleBuyNFT}
                        disabled={isWritePending}
                        className={`flex-1 ${
                          isWritePending ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-700'
                        } text-white font-bold py-2 px-4 rounded`}
                      >
                        {isWritePending ? 'Buying...' : 'Buy NFT'}
                      </button>
                      <button
                        onClick={handleDelistNFT}
                        disabled={isWritePending}
                        className={`flex-1 ${
                          isWritePending ? 'bg-gray-500' : 'bg-yellow-500 hover:bg-yellow-700'
                        } text-white font-bold py-2 px-4 rounded`}
                      >
                        {isWritePending ? 'Delisting...' : 'Delist NFT'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易状态 */}
            {(isSuccess || isWriteError) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Transaction Status</h2>
                {isSuccess && (
                  <div className="p-4 bg-green-100 text-green-800 rounded">
                    <p>Transaction successful!</p>
                    <p className="text-sm break-all">Hash: {hash}</p>
                  </div>
                )}

                {isWriteError && (
                  <div className="p-4 bg-red-100 text-red-800 rounded">
                    <p>Error with transaction: {writeError?.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}