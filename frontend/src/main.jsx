import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'

//wagmi
import { WagmiProvider, configureChains, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public'

//web3modal/ethereum
import { EthereumClient, w3mConnectors} from '@web3modal/ethereum'

//web3modal/react
import { Web3Modal} from '@web3modal/react'

// ⚙️ Your WalletConnect Project ID
const projectId = '4234666a862ca5511dd22e000d2bb773';

// ✅ Configure chains and clients
const chains = [sepolia];

const { publicClient } = configureChains(
  chains,
  [
    alchemyProvider({ apiKey: 'rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM' }),
    publicProvider()
  ]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
// 💡 EthereumClient is needed for Web3Modal component
const ethereumClient = new EthereumClient(wagmiConfig, chains);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiProvider config={wagmiConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WagmiProvider>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Provider>
  </React.StrictMode>,
)
