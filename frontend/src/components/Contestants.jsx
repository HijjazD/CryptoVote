import React from 'react'
import { BiUpvote } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { truncate, voteCandidate } from '../services/blockchain'

const Contestants = ({contestants, poll}) => {
  return (
    <div className="space-y-2">
        <h1 className="text-center text-[48px] font-[600px]">Contestants</h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 pb-7 gap-[62px] sm:w-2/3 xl:w-11/12 mx-auto"> 
            {contestants.map((contestant) => (
                <Contestant key={contestant.id} contestant={contestant} poll={poll} />
            ))}
        </div>
    </div>
  )
}

const Contestant = ({contestant, poll}) => {
    const { wallet } = useSelector((state) => state.globalStates)
    const voteContestant = async () => {
        await toast.promise(
            new Promise((resolve, reject) => {
                voteCandidate(poll.id, contestant.id)
                .then((tx) => {
                    console.log(tx)
                    resolve(tx)
                })
                .catch((error) => reject(error))
            }),
            {
                pending: 'Approve transaction...',
                success: 'Voted contestant successfully 👌',
                error: 'Encountered error 🤯',
            }
        )
    }
    return(
        <div className="flex justify-center items-center space-x-2 sm:space-x-8 mt-5 px-4 w-full">
            <div className="w-[187px] sm:w-[324px] h-[229px] sm:h-[180px] rounded-[24px] overflow-hidden">
                <img
                    src={contestant.image} 
                    alt={contestant.name} 
                    className='w-full h-full object-cover'    
                />
            </div>

            <div
                className="bg-[rgb(189,189,189)] h-[229px] w-[186px] sm:w-[253px] sm:h-fit rounded-[24px]
                space-y-2 flex justify-center items-center flex-col pt-2 pb-2 px-3"
            >
                <h1 className="text-[16px] sm:text-[20px] font-[600px] capitalize">{contestant.name}</h1>
                <div
                    className="flex items-center justify-center w-full
                    rounded-[10px] space-x-2"
                >
                    <div className="w-[32px] h-[32px] rounded-full bg-[#2C2C2C]" />
                    <p className="text-[14px] font-[500px]">
                        {truncate({ text: contestant.voter, startChars: 4, endChars: 4, maxLength: 11 })}
                    </p>
                </div>

                <button
                    onClick={voteContestant}
                    disabled={
                        wallet
                        ? contestant.voters.includes(wallet) ||
                            Date.now() < poll.startsAt ||
                            Date.now() >= poll.endsAt
                        : true
                    }
                    className={`w-[158px] sm:w-[213px] h-[48px] rounded-[30.5px] ${
                        (wallet && poll.voters.includes(wallet)) ||
                        Date.now() < poll.startsAt ||
                        Date.now() >= poll.endsAt
                        ? 'bg-[#B0BAC9] cursor-not-allowed'
                        : 'bg-[#1B5CFE]'
                    }`}
                >
                    {wallet && contestant.voters.includes(wallet) ? 'Voted' : 'Vote'}
                </button>

                <div className="w-[86px] h-[32px] flex items-center justify-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-[9px] py-[8px] px-[9px] bg-[#0E1933]">
                        <BiUpvote size={15} className="text-[#1B5CFE]" />
                    </div>
                    <p className="text-[14px] font-[600px]">{contestant.votes} vote</p>
                </div>
            </div>
        </div>
    )
}

export default Contestants