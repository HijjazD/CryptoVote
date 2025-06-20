import React from 'react'
import { BiUpvote } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { truncate, voteCandidate } from '../services/blockchain'
import { useAuthStore } from '../store/authStore'

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

  const voteContestant = async () => {
    console.log("trying to vote..");

    // 🔴 Wallet not connected
    if (!wallet) {
      toast.error("Connect wallet first!");
      return;
    }

    // 🔴 User already voted
    const hasVoted = contestant.voters
      .map((v) => v.toLowerCase())
      .includes(wallet.toLowerCase());

    if (hasVoted) {
      toast.error("You have already voted for this contestant.");
      return;
    }

    if (user?.hasVoted) {
      toast.error("You have already voted in this poll.");
      return;
    }

    // 🔴 Poll hasn't started
    if (Date.now() < poll.startsAt) {
      toast.error("Voting hasn't started yet.");
      return;
    }

    // 🔴 Poll ended
    if (Date.now() >= poll.endsAt) {
      toast.error("Voting has ended.");
      return;
    }

    // ✅ Try voting
    try {
      const tx = await toast.promise(
        voteCandidate(poll.id, contestant.id),
        {
          pending: "Approve transaction...",
          success: "Voted successfully 👌",
          error: "Transaction failed 🤯",
        }
      );

      console.log(tx);
      await voteConfirmationEmail(user.email);
    } catch (error) {
      console.error("Error voting or sending confirmation email", error);
    }
  };

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

        {/* ✅ Always clickable, logic handled in handler */}
        <button
          onClick={voteContestant}
          className={`w-[158px] sm:w-[213px] h-[48px] rounded-[30.5px] ${
            !wallet ||
            contestant.voters
              .map((v) => v.toLowerCase())
              .includes(wallet.toLowerCase()) ||
            Date.now() < poll.startsAt ||
            Date.now() >= poll.endsAt
              ? "bg-[#B0BAC9] cursor-not-allowed"
              : "bg-[#1B5CFE]"
          }`}
        >
          {wallet &&
          contestant.voters
            .map((v) => v.toLowerCase())
            .includes(wallet.toLowerCase())
            ? "Voted"
            : "Vote"}
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
