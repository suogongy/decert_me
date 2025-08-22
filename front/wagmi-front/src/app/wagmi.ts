import { http, createConfig } from 'wagmi'
import { anvil, mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// 如果您有Infura项目ID，可以替换'YOUR_INFURA_PROJECT_ID'为实际的项目ID
// 否则可以继续使用默认的公共端点
export const config = createConfig({
  chains: [sepolia, anvil, mainnet],
  connectors: [injected()],
  transports: {
    // 使用Infura RPC端点（推荐）
    // [sepolia.id]: http(`https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID`),
    
    // 或者使用Alchemy RPC端点
    // [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'),
    
    // 或者使用公共端点（可能不稳定）
    [sepolia.id]: http(),
    [anvil.id]: http(),
    [mainnet.id]: http(),
  },
})