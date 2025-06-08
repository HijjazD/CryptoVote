import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Polls from '../components/Polls'
import Footer from '../components/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '../store/globalSlices'

import CreatePoll from '../components/createPoll'
import { getPolls } from '../services/blockchain'

const HomePage = () => {
  const dispatch = useDispatch()
  const { setPolls } = globalActions
  const { polls, wallet } = useSelector((state) => state.globalStates)

  const fetchPolls = async () => {
    try {
      const data = await getPolls()
      dispatch(setPolls(data))
    } catch (error) {
      console.error("Failed to fetch polls:", error)
    }
  }

  // Track current network chainId
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    const ethereum = window.ethereum
    if (!ethereum) return

    // On network change, update chainId and fetch polls
    const handleChainChanged = (chainIdHex) => {
      const chainIdDec = parseInt(chainIdHex, 16)
      setChainId(chainIdDec)
      fetchPolls()
    }

    // On accounts changed, refetch polls
    const handleAccountsChanged = (accounts) => {
      fetchPolls()
    }

    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)

    // Set initial chainId and fetch polls once component mounts and wallet connected
    ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged).catch(console.error)
    
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [dispatch])

  // Fetch polls initially when wallet and chainId are ready
  useEffect(() => {
    if (wallet && chainId === 11155111) { // Sepolia chainId decimal
      fetchPolls()
    }
  }, [wallet, chainId])
  return (
    <div className='flex flex-col min-h-screen pt-5'>
      <div className='px-4'>
        <Navbar />
      </div>
      <div className="pt-30 flex-grow">
        <Banner />
        <Polls polls={polls} />
        <CreatePoll />
      </div>
      <Footer /> 
      
    </div>
  )
}

export default HomePage
