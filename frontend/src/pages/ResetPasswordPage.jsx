import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, isLoading, message } = useAuthStore();

	const { token } = useParams();
	const navigate = useNavigate();

    const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}
		try {
			await resetPassword(token, password);

			toast.success("Password reset successfully, redirecting to login page...");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error) {
			console.error(error);
			toast.error(error.message || "Error resetting password");
		}
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
                        Reset Password
                    </h2>
                    {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
                    {message && <p className='text-green-500 text-sm mb-4'>{message}</p>}

                    <form onSubmit={handleSubmit}>
                        <Input
                            icon={Lock}
                            type='password'
                            placeholder='New Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Input
                            icon={Lock}
                            type='password'
                            placeholder='Confirm New Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Set New Password"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
    </div>
  )
}

export default ResetPasswordPage
