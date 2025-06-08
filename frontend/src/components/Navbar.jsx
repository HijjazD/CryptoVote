import { Link } from "react-router-dom";
import React from "react";
import { connectWallet } from "../services/blockchain";
import { truncate } from "../utils/helper";
import { useSelector } from "react-redux";
import { useAuthStore } from "../store/authStore";
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { wallet } = useSelector((states) => states.globalStates)
  const { user, claimToken , setUser} = useAuthStore();
  const handleClaimToken = async () => {
  if (!wallet) {
    toast.error("Please connect your wallet first");
    return;
  }

  const loadingToast = toast.loading("Claiming token...");
    try {
      await claimToken(wallet, user._id);
      toast.success("Token claimed successfully!", { id: loadingToast });

      // ✅ Update local state so button disappears immediately
      setUser({ ...user, hasClaim: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to claim token", {
        id: loadingToast,
      });
    }
  };
  return (
    <div>
      <nav
        className="h-[80px] flex justify-between items-center border border-gray-400 
        px-5 rounded-full"
      >
        <Link to="/" className="text-[20px] font-bold text-white sm:text-[24px]">
          crypto<span className="text-white font-bold">Votes</span>
        </Link>

        {wallet ? (
          <button
            className="h-[48px] w-[130px] 
            sm:w-[148px] px-3 rounded-full text-sm font-bold
            transition-all duration-300 bg-[rgb(179,199,249)] hover:bg-blue-500"
          >
            {truncate({ text: wallet, startChars: 4, endChars: 4, maxLength: 11 })}
          </button>
        ) : (
          <button
            className="h-[48px] w-[130px] 
            sm:w-[148px] px-3 rounded-full text-sm font-bold
            transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-300"
            onClick={connectWallet}
          >
            Connect wallet
          </button>
        )}
      </nav>
      {wallet && user && user.hasClaim === false && (
        <div className="flex justify-end mt-2 px-5">
          <button
            className="w-[130px] sm:w-[148px] h-[40px] px-3 
               text-white text-[12px] md:text-[16px] text-sm font-semibold 
               border border-gray-400 rounded-full 
               bg-white/10 backdrop-blur-sm 
               transition-all duration-300"
            onClick={handleClaimToken}
          >
            Claim Token
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
