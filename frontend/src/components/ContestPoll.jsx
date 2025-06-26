import {useState,useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { Loader } from 'lucide-react'

import { globalActions } from '../store/globalSlices'

import { useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract } from 'wagmi'
import { contractAbi, contractAddress } from '../constant/constant'

const ContestPoll = ({ poll }) => {
  const dispatch = useDispatch()
  const { setContestModal} = globalActions
  const { contestModal } = useSelector((states) => states.globalStates)

  const [contestant, setContestant] = useState({
    name: '',
    image: '',
  })
  const [error, setError] = useState('')
  const { address, isConnected } = useAppKitAccount()

  const {
    writeContract,
    isPending,
    isSuccess,
    error: writeError,
  } = useWriteContract()

  const handleChange = (e) => {
    const { name, value } = e.target
    setContestant((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isConnected || !address) {
      toast.error('Connect wallet first!')
      return
    }

    if (!contestant.name || !contestant.image) {
      toast.error('Please fill in all fields!')
      return
    }

    toast.loading('Submitting your candidacy...')

    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'contest',
      args: [poll.id, contestant.name, contestant.image],
    })
  }

  // ✅ On success
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss()
      toast.success('You are now a contestant!')
      closeModal()
    }
  }, [isSuccess])

  // ❌ On error
  useEffect(() => {
    if (writeError) {
      toast.dismiss()
      toast.error('Failed to join poll.')
      setError(writeError.message)
    }
  }, [writeError])

  const closeModal = () => {
    dispatch(setContestModal('scale-0'))
    setContestant({ name: '', image: '' })
    setError('')
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
    bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${contestModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#1B5CFE] rounded-xl w-11/12 md:w-2/5 max-h-screen overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Become a Contestant</p>
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
                placeholder="Contestant Name"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="name"
                value={contestant.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Avater URL"
                type="url"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="image"
                accept="image/*"
                value={contestant.image}
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
              type="submit"
              className="h-[48px] w-full mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500 flex items-center justify-center"
              disabled={isPending}
            >
              {isPending ? <Loader className="animate-spin w-5 h-5" /> : 'Contest Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default ContestPoll