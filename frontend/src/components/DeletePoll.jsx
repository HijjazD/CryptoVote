import { useState, useEffect } from 'react'
import { BsTrash3Fill } from 'react-icons/bs'
import { FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { globalActions } from '../store/globalSlices'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract } from 'wagmi'
import { contractAbi, contractAddress } from '../constant/constant'
const DeletePoll = ({ poll }) => {
  const dispatch = useDispatch()
  const { setDeleteModal } = globalActions
  const { deleteModal } = useSelector((states) => states.globalStates)
  const navigate = useNavigate()


  const { address, isConnected } = useAppKitAccount()
  const [error, setError] = useState('')

  const {
    writeContract,
    isPending,
    isSuccess,
    error: writeError,
  } = useWriteContract()

  const handleDelete = async () => {
    if (!isConnected || !address) {
      toast.error('Connect wallet first!')
      return
    }

    toast.loading('Deleting poll...')

    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'deletePoll',
      args: [poll.id],
    })
  }

  const closeModal = () => {
    dispatch(setDeleteModal('scale-0'))
  }
  // ✅ Success
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss()
      toast.success('Poll deleted successfully!')
      closeModal()
      navigate('/')
    }
  }, [isSuccess])
  // ❌ Error
  useEffect(() => {
    if (writeError) {
      toast.dismiss()
      toast.error('Failed to delete poll.')
      setError(writeError.message)
    }
  }, [writeError])
  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${deleteModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#1B5CFE] rounded-xl w-11/12 md:w-2/5 max-h-screen overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Delete Poll</p>
            <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-col justify-center items-center rounded-xl mt-5 mb-5">
            <div className="flex flex-col justify-center items-center rounded-xl my-5 space-y-2">
              <BsTrash3Fill className="text-red-600" size={50} />
              <h4 className="text-[22.65px] font-semibold">Delete Poll</h4>
              <p className="text-[14px] text-center">Are you sure you want to delete this poll?</p>
              <small className="text-xs italic text-white/80 text-center">{poll?.title}</small>
            </div>

            {error && (
              <div className="w-full bg-red-500 bg-opacity-10 text-white text-sm p-2 rounded-lg mb-2">
                {error}
              </div>
            )}

            <button
              className="h-[48px] w-full mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-red-600 hover:bg-red-500 flex items-center justify-center"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader className="animate-spin w-5 h-5" /> : 'Delete Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeletePoll