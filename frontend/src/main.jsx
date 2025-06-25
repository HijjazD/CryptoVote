import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'

// ✅ wagmi v1 setup
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'

// ✅ web3modal v2.4.2
import { Web3Modal } from '@web3modal/react'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'

// ⚙️ WalletConnect Project ID
const projectId = '4234666a862ca5511dd22e000d2bb773'

// ⚙️ Configure chains and providers
const chains = [sepolia]

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    alchemyProvider({ apiKey: 'rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM' }),
    publicProvider(),
  ]
)

// ✅ wagmi config (not client!)
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
})

// ✅ EthereumClient for Web3Modal
const ethereumClient = new EthereumClient(wagmiConfig, chains)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig config={wagmiConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Provider>
  </React.StrictMode>
)
