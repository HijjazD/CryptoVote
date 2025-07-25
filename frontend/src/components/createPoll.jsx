import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Loader } from 'lucide-react'

import { globalActions } from '../store/globalSlices'

import { contractAbi, contractAddress } from "../constant/constant";

import { useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract } from 'wagmi'

const CreatePoll = () => {
  const { createModal } = useSelector((states) => states.globalStates)
  const dispatch = useDispatch()
  const { setCreateModal } = globalActions

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { address, isConnected } = useAppKitAccount()
  const { writeContract, isSuccess, error: writeError} = useWriteContract()

  const [poll, setPoll] = useState({
    image: '',
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setPoll((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!poll.title || !poll.description || !poll.image || !poll.startsAt || !poll.endsAt) {
      toast.error('All fields are required')
      return
    }

    const toastId = toast.loading('Creating poll...')
    try {
      setLoading(true)
      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createPoll',
        args: [
          poll.image,
          poll.title,
          poll.description,
          BigInt(poll.startsAt),
          BigInt(poll.endsAt),
        ],
      })
    } catch (err) {
      console.error('Poll creation error:', err)
      setError(err?.message || 'Something went wrong.')
      toast.error('Failed to create poll', { id: toastId })
    } 
  }


  const closeModal = () => {
    dispatch(setCreateModal('scale-0'))
    setPoll({
      image: '',
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
    })
    setError('')
    setLoading(false)
  }

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss()
      toast.success('Poll created successfully!')
      closeModal()
      setLoading(false)
    }
  }, [isSuccess])
  useEffect(() => {
  if (writeError) {
    toast.dismiss()
    toast.error('Failed to create poll')
    setError(writeError.message)
    setLoading(false) 
  }
}, [writeError])
  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
    bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${createModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#1B5CFE] rounded-xl w-11/12 md:w-2/5  max-h-screen overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Add Poll</p>
            <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-start rounded-xl mt-5 mb-5"
          >
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

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 bg-[#1B5CFE]/20">
              <DatePicker
                selected={poll.startsAt ? new Date(poll.startsAt) : null}
                onChange={(date) => {
                  setPoll({ ...poll, startsAt: date.getTime() })
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                placeholderText="Start Date and Time"
                className="w-full px-4 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 bg-[#1B5CFE]/20">
              <DatePicker
                selected={poll.endsAt ? new Date(poll.endsAt) : null}
                onChange={(date) => {
                  setPoll({ ...poll, endsAt: date.getTime() })
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                placeholderText="End Date and Time"
                className="w-full px-4 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
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

            {/* ✅ Error Message */}
            {error && (
              <div className="w-full bg-red-500 bg-opacity-10 text-white text-sm p-2 rounded-lg mb-2">
                {error}
              </div>
            )}

            {/* ✅ Submit Button with Spinner */}
            <button
              className="h-[48px] w-full mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Create Poll"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePoll
