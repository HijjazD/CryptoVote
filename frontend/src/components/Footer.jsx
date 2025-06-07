import React from 'react'
import { MdLogout } from 'react-icons/md'    
import { useAuthStore } from '../store/authStore'

const Footer = () => {
  const { logout } = useAuthStore()
  const handleLogout = () => {
		logout();
	}
  return (
    <footer className="w-full p-4 bg-gray-900 text-white flex justify-center items-center fixed bottom-0 left-0">
      <button
        className="py-[6px] px-[12px] 
                   border border-gray-400 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm text-white rounded-full 
                   text-[12px] md:text-[16px] gap-[8px] flex justify-center items-center"
        onClick={handleLogout}
      >
        <MdLogout size={20} className="text-[#1B5CFE]" />
        Logout
      </button>
    </footer>
  )
}

export default Footer
