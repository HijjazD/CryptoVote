import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { Loader } from 'lucide-react'
import { formatTimestamp } from '../services/blockchain'
import { globalActions } from '../store/globalSlices'

import { contractAbi, contractAddress } from '../constant/constant'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract } from 'wagmi'

const UpdatePoll = ({ pollData }) => {
  const dispatch = useDispatch()
  const { updateModal } = useSelector((state) => state.globalStates)
  const { setUpdateModal } = globalActions

  const [poll, setPoll] = useState({
    image: '',
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
  })

  const [error, setError] = useState('')
  const { address, isConnected } = useAppKitAccount()

  const {
    writeContract,
    isSuccess,
    isPending,
    error: writeError,
  } = useWriteContract()

  // 🔁 Prefill modal with poll data
  useEffect(() => {
    if (pollData) {
      const { image, title, description, startsAt, endsAt } = pollData
      setPoll({
        image,
        title,
        description,
        startsAt: formatTimestamp(startsAt),
        endsAt: formatTimestamp(endsAt),
      })
    }
  }, [pollData])

  // 🧾 Submit transaction
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')

    if (!isConnected || !address) {
      toast.error('Connect wallet first!')
      return
    }

    if (!poll.image || !poll.title || !poll.description || !poll.startsAt || !poll.endsAt) {
      toast.error('Please fill in all fields!')
      return
    }

    const updatedPoll = {
      ...poll,
      startsAt: new Date(poll.startsAt).getTime(),
      endsAt: new Date(poll.endsAt).getTime(),
    }

    toast.loading('Updating poll...')

    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'updatePoll',
      args: [
        pollData.id,
        updatedPoll.image,
        updatedPoll.title,
        updatedPoll.description,
        BigInt(updatedPoll.startsAt),
        BigInt(updatedPoll.endsAt),
      ],
    })
  }

  // ✅ Toast & modal close
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss()
      toast.success('Poll updated successfully!')
      closeModal()
    }
  }, [isSuccess])

  useEffect(() => {
    if (writeError) {
      toast.dismiss()
      toast.error('Poll update failed.')
      setError(writeError.message)
    }
  }, [writeError])

  const closeModal = () => {
    dispatch(setUpdateModal('scale-0'))
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPoll((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${updateModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#1B5CFE] rounded-xl w-11/12 md:w-2/5 max-h-screen overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Edit Poll</p>
            <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col justify-center items-start rounded-xl mt-5 mb-5">
            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Poll Title"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="title"
                value={poll.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 space-x-2 bg-[#1B5CFE]/20">
              <input
                className="w-full px-4 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                name="startsAt"
                type="datetime-local"
                value={poll.startsAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 space-x-2 bg-[#1B5CFE]/20">
              <input
                className="w-full px-4 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                name="endsAt"
                type="datetime-local"
                value={poll.endsAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Banner URL"
                type="url"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="image"
                accept="image/*"
                value={poll.image}
                onChange={handleChange}
                required
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-xl flex items-center px-4 h-20 mt-2">
              <textarea
                placeholder="Poll Description"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="description"
                value={poll.description}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="w-full bg-red-500 bg-opacity-10 text-white text-sm p-2 rounded-lg mb-2">
                {error}
              </div>
            )}

            <button
              className="h-[48px] w-full mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500 flex items-center justify-center"
              disabled={isPending}
            >
              {isPending ? <Loader className="animate-spin w-5 h-5" /> : 'Update Poll'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdatePoll
