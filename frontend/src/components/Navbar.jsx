import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { useAuthStore } from '../store/authStore'
import { globalActions } from '../store/globalSlices'
import { useDispatch } from 'react-redux'


import { useAppKitAccount } from '@reown/appkit/react'

const Navbar = () => {
  const dispatch = useDispatch()
  const { user, claimToken, setUser } = useAuthStore()


   // ✅ AppKit handles wallet state
  const { address, isConnected } = useAppKitAccount()
  const { setWallet } = globalActions

  // 🔄 Sync Redux with wallet
  useEffect(() => {
    dispatch(setWallet(isConnected ? address : ''))
  }, [isConnected, address])

  // 🪙 Handle token claim
  const handleClaimToken = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    const loadingId = toast.loading('Claiming token...')
    try {
      await claimToken(address, user._id)
      toast.success('Token claimed successfully!', { id: loadingId })
      setUser({ ...user, hasClaim: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to claim token', { id: loadingId })
    }
  }

  return (
    <div>
      <nav
        className="h-[80px] flex justify-between items-center border border-gray-400 
        px-5 rounded-full"
      >
        
          <Link to="/" className="text-[20px] text-blue-800 sm:text-[24px]">
            Crypto<span className="text-white font-bold">Votes</span>
          </Link>
          <appkit-button />

      </nav>

      {/* 👇 Token claim + network switch */}
      {isConnected && (
        <div className="flex flex-col items-end mt-2 px-5 space-y-2">
          {user?.hasClaim === false && (
            <button
              onClick={handleClaimToken}
              className="w-[130px] sm:w-[148px] h-[40px] px-3 
                text-white text-[12px] md:text-[16px] font-semibold 
                border border-gray-400 rounded-full 
                bg-white/10 backdrop-blur-sm 
                transition-all duration-300"
            >
              Claim Token
            </button>
          )}
          <appkit-network-button />
        </div>
      )}
    </div>
  )
}

export default Navbar
