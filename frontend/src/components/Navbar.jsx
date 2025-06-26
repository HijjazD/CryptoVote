import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { truncate } from '../utils/helper'
import { useAuthStore } from '../store/authStore'
import { globalActions } from '../store/globalSlices'

// ✅ wagmi hooks (used by Reown internally)
import { useAccount} from 'wagmi'

const Navbar = () => {
  const dispatch = useDispatch()
  const { setWallet } = globalActions
  const { wallet } = useSelector((state) => state.globalStates)
  const { user, claimToken, setUser } = useAuthStore()

  const { address, isConnected } = useAccount()

  // 🔄 Sync Redux with wallet
  useEffect(() => {
    if (isConnected && address) {
      dispatch(setWallet(address))
    } else {
      dispatch(setWallet(''))
    }
  }, [isConnected, address, dispatch])

  // 🪙 Handle token claim
  const handleClaimToken = async () => {
    if (!wallet) {
      toast.error('Please connect your wallet first')
      return
    }

    const loading = toast.loading('Claiming token...')
    try {
      await claimToken(wallet, user._id)
      toast.success('Token claimed successfully!', { id: loading })
      setUser({ ...user, hasClaim: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to claim token', {
        id: loading,
      })
    }
  }

  return (
    <div>
      <nav
        className="h-[80px] flex justify-between items-center border border-gray-400 
        px-5 rounded-full"
      >
        

          {/* 🌐 Network Switch */}
          <w3m-network-button />

          {/* 🔘 Connect/Disconnect Wallet */}
          <w3m-button />
        
      </nav>

      {/* 👇 Token claim logic */}
      {wallet && user && user.hasClaim === false && (
        <div className="flex justify-end mt-2 px-5">
          <button
            className="w-[130px] sm:w-[148px] h-[40px] px-3 
              text-white text-[12px] md:text-[16px] font-semibold 
              border border-gray-400 rounded-full 
              bg-white/10 backdrop-blur-sm 
              transition-all duration-300"
            onClick={handleClaimToken}
          >
            Claim Token
          </button>
        </div>
      )}
    </div>
  )
}

export default Navbar
