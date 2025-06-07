import React, { useEffect } from 'react'
import { motion } from "framer-motion"
import Input from "../components/Input";
import { Loader, Lock } from "lucide-react";
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from 'react-router-dom';





const PassPage = () => {
  const {token} = useParams()
  const [password, setPassword] = useState("");
  const [biometricsEnabled, setBiometricsEnabled] = useState(false)
  const navigate = useNavigate()

  const { savePass, error, isLoading, initPasskey } = useAuthStore()

  useEffect(() => {
    if (biometricsEnabled) {
      initPasskey(token);
    }
  }, [biometricsEnabled]);
  

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      await savePass(password,token)
      navigate("/")
    }catch (error) {
      console.log(error)
    }
  } 
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-md w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 backdrop-blur-xl 
                rounded-2xl shadow-xl overflow-hidden'
      >
        <div className="p-8">
          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-gray-500 to-gray-300 text-transparent bg-clip-text'>
            Create Password
          </h2>

          <form onSubmit={handleSignUp}>
            <Input
              icon={Lock}
              type='password'
              placeholder='Password'
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={password} />

            {/* ✅ Enable Biometrics toggle */}
            <div className="flex items-center justify-between mt-6 mb-4">
              <span className="text-white text-sm font-medium">Enable Biometrics</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={biometricsEnabled}
                  onChange={() => setBiometricsEnabled(!biometricsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 
                  after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white 
                  after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>


            <motion.button
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-300 text-black 
              font-bold rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-400 
              focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 
              focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              
            > 
              Create Password
            </motion.button>
          </form>

        </div>

      </motion.div>
    </div>
  )
}

export default PassPage