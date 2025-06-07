import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '../store/globalSlices'
import { useAuthStore } from "../store/authStore";

const Banner = () => {
  const { createModal } = useSelector((states) => states.globalStates)
  const dispatch = useDispatch()
  const { setCreateModal } = globalActions
  const { user } = useAuthStore();
 
  return (
    <main className="mx-auto text-center space-y-8 px-4">
      <div className="mx-auto max-w-[90vw] sm:max-w-xl">
        <h1 className="typewriter text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Vote Without Rigging
        </h1>
      </div>

      <p className="text-[16px] font-medium text-white p-4 mb-6">
          CryptoVote is a secure and transparent voting platform powered by blockchain 
          technology. Designed to prevent tampering, double voting, and fraud, 
          it ensures that every vote is verifiable, anonymous, 
          and counted exactly once, bringing trust back to digital elections.
      </p>

      {user?.isAdmin && (
        <button
          className="h-[45px] w-[148px] rounded-full border border-gray-400 bg-white text-black font-medium
                    hover:bg-black hover:text-white transition-all duration-300 mb-6"
          onClick={() => dispatch(setCreateModal('scale-100'))}
        >
          Create poll
        </button>
      )}
    </main>
  )
}

export default Banner
