import { useEffect, useState } from 'react'
import { BiUpvote } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { truncate} from '../services/blockchain'
import { useAuthStore } from '../store/authStore'


import { useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract } from 'wagmi'
import { contractAbi, contractAddress } from '../constant/constant'


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

const Contestant = ({ contestant, poll }) => {
  const { user, voteConfirmationEmail } = useAuthStore();
  const { wallet } = useSelector((state) => state.globalStates);
  const { address, isConnected } = useAppKitAccount()

  const {
    writeContract,
    isPending,
    isSuccess,
    error: writeError,
    data: txData,
  } = useWriteContract()
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (address && contestant.voters) {
      setHasVoted(
        contestant.voters.map((v) => v.toLowerCase()).includes(address.toLowerCase())
      )
    }
  }, [contestant.voters, address])

  const voteContestant = async () => {
    if (!isConnected || !address) {
      toast.error('Connect wallet first!')
      return
    }

    if (hasVoted) {
      toast.error('You have already voted for this contestant.')
      return
    }

    if (user?.hasVoted) {
      toast.error('You have already voted in this poll.')
      return
    }

    if (Date.now() < poll.startsAt) {
      toast.error("Voting hasn't started yet.")
      return
    }

    if (Date.now() >= poll.endsAt) {
      toast.error('Voting has ended.')
      return
    }

    toast.loading('Submitting your vote...')

    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'vote',
      args: [poll.id, contestant.id],
    })
  }
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss()
      toast.success('Voted successfully 👌')
      voteConfirmationEmail(user.email)
    }
  }, [isSuccess])

  useEffect(() => {
    if (writeError) {
      toast.dismiss()
      toast.error('Transaction failed 🤯')
      console.error(writeError)
    }
  }, [writeError])
  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-8 mt-5 px-4 w-full">
      <div className="w-[187px] sm:w-[324px] h-[229px] sm:h-[180px] rounded-[24px] overflow-hidden">
        <img
          src={contestant.image}
          alt={contestant.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="bg-[rgb(189,189,189)] h-[229px] w-[186px] sm:w-[253px] sm:h-fit rounded-[24px]
        space-y-2 flex justify-center items-center flex-col pt-2 pb-2 px-3"
      >
        <h1 className="text-[16px] sm:text-[20px] font-[600px] capitalize">
          {contestant.name}
        </h1>

        <div
          className="flex items-center justify-center w-full
          rounded-[10px] space-x-2"
        >
          <div className="w-[32px] h-[32px] rounded-full bg-[#2C2C2C]" />
          <p className="text-[14px] font-[500px]">
            {truncate({
              text: contestant.voter,
              startChars: 4,
              endChars: 4,
              maxLength: 11,
            })}
          </p>
        </div>

        <button
          onClick={voteContestant}
          className={`w-[158px] sm:w-[213px] h-[48px] rounded-[30.5px] ${
            hasVoted ||
            !isConnected ||
            Date.now() < poll.startsAt ||
            Date.now() >= poll.endsAt
              ? 'bg-[#B0BAC9] cursor-not-allowed'
              : 'bg-[#1B5CFE]'
          }`}
          disabled={
            hasVoted ||
            !isConnected ||
            Date.now() < poll.startsAt ||
            Date.now() >= poll.endsAt ||
            isPending
          }
        >
          {isPending ? 'Voting...' : hasVoted ? 'Voted' : 'Vote'}
        </button>

        <div className="w-[86px] h-[32px] flex items-center justify-center gap-3">
          <div className="w-[32px] h-[32px] rounded-[9px] py-[8px] px-[9px] bg-[#0E1933]">
            <BiUpvote size={15} className="text-[#1B5CFE]" />
          </div>
          <p className="text-[14px] font-[600px]">{contestant.votes} vote</p>
        </div>
      </div>
    </div>
  );
};


export default Contestants