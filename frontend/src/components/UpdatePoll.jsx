import React,{ ChangeEvent, FormEvent, useEffect, useState }  from 'react'
import { updatePoll, formatTimestamp } from '../services/blockchain'
import { globalActions } from '../store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FaTimes } from 'react-icons/fa'

const UpdatePoll = ({pollData}) => {
    const dispatch = useDispatch()
    const { setUpdateModal } = globalActions
    const { wallet, updateModal } = useSelector((states) => states.globalStates)

    const [poll, setPoll] = useState({
        image: '',
        title: '',
        description: '',
        startsAt: '',
        endsAt: '',
    })

    //useEffect
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


    const handleUpdate = async(e) => {
        e.preventDefault()

        if (!poll.image || !poll.title || !poll.description || !poll.startsAt || !poll.endsAt) return
        if (wallet === '') return toast.warning('Connect wallet first!')

        poll.startsAt = new Date(poll.startsAt).getTime()
        poll.endsAt = new Date(poll.endsAt).getTime()

        await toast.promise(
        new Promise((resolve, reject) => {
            updatePoll(pollData.id, poll)
            .then((tx) => {
                closeModal()
                console.log(tx)
                resolve(tx)
            })
            .catch((error) => reject(error))
        }),
        {
            pending: 'Approve transaction...',
            success: 'Poll updated successfully 👌',
            error: 'Encountered error 🤯',
        }
        )
    }
    const handleChange = (e) => {
        const { name, value } = e.target
        setPoll((prevState) => ({
        ...prevState,
        [name]: value,
        }))
    }

    const closeModal = () => {
        dispatch(setUpdateModal('scale-0'))
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

                <form
                    onSubmit={handleUpdate}
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
                    <div className="py-4 w-full border border-[#212D4A] rounded-full
                        flex items-center px-4 mb-3 mt-2 space-x-2 bg-[#1B5CFE]/20"
                    >
                        <input 
                            className="w-full px-4 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                            name="startsAt"
                            type="datetime-local"
                            value={poll.startsAt}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="py-4 w-full border border-[#212D4A] rounded-full
                        flex items-center px-4 mb-3 mt-2 space-x-2 bg-[#1B5CFE]/20"
                    >
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

                    <button
                        className="h-[48px] w-full block mt-2 px-3 rounded-full text-sm font-bold
                        transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
                    >
                        Update Poll
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default UpdatePoll