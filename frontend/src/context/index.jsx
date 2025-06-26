import { wagmiAdapter, projectId, networks } from '../config'
import { createAppKit } from '@reown/appkit'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

const metadata = {
  name: 'CryptoVote',
  description: 'A decentralized student voting system',
  url: 'https://www.cryptovote.online', // must be a real URL in production
  icons: ['https://i.imgur.com/SrbkO1W.png'] // recommended to be square
}


const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[1], // sepolia
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x'],
    emailShowWallets: true,
  },
  themeMode: 'dark',
})

function ContextProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
