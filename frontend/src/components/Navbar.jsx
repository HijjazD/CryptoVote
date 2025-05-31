import { Link } from "react-router-dom";
import React from "react";
import { connectWallet } from "../services/blockchain";
import { truncate } from "../utils/helper";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { wallet } = useSelector((states) => states.globalStates)

  return (
    <nav
      className="h-[80px] flex justify-between items-center border border-gray-400 
      px-5 rounded-full"
    >
      <Link to="/" className="text-[20px] font-bold text-black-800 sm:text-[24px]">
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
  );
};

export default Navbar;
