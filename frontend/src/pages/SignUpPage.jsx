import { motion } from "framer-motion"
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react"
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {

    const [matric, setMatric] = useState("")

    const { signup, error, isLoading } = useAuthStore()

    const navigate = useNavigate()

    const handleSignUp = async (e) => {
        e.preventDefault()
        try {
            await signup(matric)
            navigate("/verify-email")
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      
        <img
            src="/assets/images/cryptovote.png"
            alt="CryptoVote Logo"
            className="absolute top-30 w-[200px] h-[200px] "
        />

        
        <div className="flex-grow flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 backdrop-blur-xl 
                rounded-2xl shadow-xl overflow-hidden'
            >
                <div className="p-8" >
                    <h2 className='text-3xl font-bold mb-6 text-center text-gray-400'>
                        Create Account
                    </h2>

                    <form onSubmit={handleSignUp} >
                        <Input
                            icon={User}
                            type='text'
                            placeholder='Student Matric'
                            value={matric}
                            onChange={(e) => setMatric(e.target.value)}
                        />
                        {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}

                        <motion.button
                            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-300 text-black 
                            font-bold rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 
                            focus:ring-offset-gray-900 transition duration-200"

                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type='submit'
                            disabled={isLoading}
                        > 
                            {isLoading ? <Loader className="animate-spin mx-auto" size={24}/> : "Sign Up"}
                        </motion.button>
                    </form>
                </div>
                <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                    <p className='text-sm text-gray-400'>
                        Already have an account?{" "}
                        <Link to={"/login"} className="text-indigo-400 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    </div>
  )
}

export default SignUpPage