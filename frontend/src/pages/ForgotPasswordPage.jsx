import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { isLoading, forgotPassword } = useAuthStore();

	const handleSubmit = async (e) => {
        const studentMatric = email
		e.preventDefault();
		await forgotPassword(studentMatric);
		setIsSubmitted(true);
	};
  return (
    <div className="flex items-center justify-center min-h-screen">
			<div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md'
				>
					<h2 className='text-3xl font-bold mb-6 text-center text-gray-400'>
						Forgot Password
					</h2>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit}>
                            <p className='text-gray-300 mb-6 text-center'>
                                Enter your username and we'll send you a link to reset your password.
                            </p>
                            <Input
                                icon={User}
                                type='text'
                                placeholder='Student Matric'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-300 text-black 
                                font-bold rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-400 
                                focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 
                                focus:ring-offset-gray-900 transition duration-200"
                                type='submit'
                            >
                                {isLoading ? <Loader className='size-6 animate-spin mx-auto' /> : "Send Reset Link"}
                            </motion.button>
                        </form>
                    ) : (
                        <div className='text-center'>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'
                            >
                                <Mail className='h-8 w-8 text-blue' />
                            </motion.div>
                            <p className='text-gray-300 mb-6'>
                                If a siswa account exists for {email}, you will receive a password reset link shortly.
                            </p>
                        </div>
				    )}
                    
                </motion.div>

                <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                    <Link to={"/login"} className='text-sm text-blue-400 hover:underline flex items-center'>
                        <ArrowLeft className='h-4 w-4 mr-2' /> Back to Login
                    </Link>
                </div>
            </div>
            
    </div>
  )
}

export default ForgotPasswordPage
