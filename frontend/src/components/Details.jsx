import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate, truncate } from '../services/blockchain'
import { MdModeEdit, MdDelete } from 'react-icons/md'
import { globalActions } from '../store/globalSlices'
import { toast } from 'react-toastify'

const Details = ({poll}) => {
    
    const dispatch = useDispatch()
    const { setUpdateModal, setDeleteModal, setContestModal  } = globalActions
    const { wallet } = useSelector((state) => state.globalStates)

    if (!poll) {
        return <div className="text-center mt-10 text-gray-500">Loading poll details...</div>;
    }

    const onPressContest = () => {
        if (wallet === '') return toast.warning('Connect wallet first!')
        console.log("Opening contest modal")
        dispatch(setContestModal('scale-100'))
    }

  return (
    <>
        <div
            className="w-full h-[240px] 
            flex items-center justify-center overflow-hidden px-6"
        >          
            <img 
                src={poll.image} 
                alt={poll.title} 
                className='w-full h-full rounded-[60px] object-cover'    
            />
        </div>

        <div className="flex flex-col items-center justify-center space-y-6
            mt-5 w-full md:max-w-[736px] mx-auto"
        >
            <h1 className="text-[47px] font-[600px] text-center leading-none text-white">{poll.title}</h1>
            <p className="text-[16px] font-[500px] text-center text-white">{poll.description}</p>

            <div className="relative h-[136px] gap-[16px] flex flex-col items-center mt-4">
                <div
                    className="h-[36px] py-[6px] px-[12px] rounded-full gap-[4px] border 
                    border-gray-400 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm"
                >
                    <p className="text-[14px] font-[500px] text-center md:text-[16px] text-white" >
                        {formatDate(poll.startsAt)} - {formatDate(poll.endsAt)}
                    </p>
                </div>

                <div
                    className="flex items-center justify-center w-[133px] h-[32px]
                    py-[20px] rounded-[10px] gap-[12px]"
                >
                    <div className="w-[32px] h-[32px] rounded-full bg-[#1B5CFE]"/>
                    <p className="text-[14px] font-[500px] text-white">
                        {truncate({ text: poll.director, startChars: 4, endChars: 4, maxLength: 11 })}
                    </p>
                </div>

                <div className="h-[36px] gap-[4px] flex justify-center items-center px-4">
                    <button
                        className="py-[6px] px-[12px] border border-gray-400  bg-[rgba(255,255,255,0.1)] backdrop-blur-sm
                        rounded-full text-[12px] md:text-[16px] text-white"
                    >
                       {poll.votes} votes
                    </button>

                    <button
                        className="py-[6px] px-[12px] 
                        border border-gray-400  bg-[rgba(255,255,255,0.1)] backdrop-blur-sm rounded-full text-[12px] md:text-[16px] text-white"
                    >
                        {poll.contestants} contestants
                    </button>

                    {wallet && wallet === poll.director && poll.votes < 1 && (
                        <button
                            className="py-[6px] px-[12px] 
                            border border-gray-400 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm text-white rounded-full 
                            text-[12px] md:text-[16px] gap-[8px] flex justify-center items-center"
                            onClick={() => dispatch(setUpdateModal('scale-100'))}
                        >
                            <MdModeEdit size={20} className="text-[#1B5CFE]" />
                            Edit poll
                        </button>
                    )}

                    {wallet && wallet === poll.director && poll.votes < 1 && (
                        <button
                            className="py-[6px] px-[12px] 
                            border border-gray-400 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm text-white rounded-full 
                            text-[12px] md:text-[16px] gap-[8px] flex justify-center items-center"
                            onClick={() => dispatch(setDeleteModal('scale-100'))}
                        >
                            <MdDelete size={20} className="text-[#fe1b1b]" />
                            Delete poll
                        </button>
                    )}
                </div>

                {poll.votes < 1 && (
                    <button
                        className="z-10 relative h-[45px] w-[148px] rounded-full border border-gray-400 bg-white text-black transition duration-300 hover:bg-black hover:text-white"
                        onClick={onPressContest}
                    >
                        Contests
                    </button>
                )}    
            </div>
        </div>
    </>
    
  )
}

export default Details