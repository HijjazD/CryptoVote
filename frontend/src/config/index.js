import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

export const projectId = '4234666a862ca5511dd22e000d2bb773' 

export const networks = [sepolia]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: false, // you're not using SSR
  networks,
  projectId,
})

export const config = wagmiAdapter.wagmiConfig
