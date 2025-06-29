import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Loader, Lock, User } from "lucide-react";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
    const [matric, setMatric] = useState("")
	const [password, setPassword] = useState("");
	const [biometricsEnabled, setBiometricsEnabled] = useState(false)
    const isMatricFilled = matric.trim().length > 0;
	const { error, isLoading, authPasskey, login} = useAuthStore()
	const navigate = useNavigate()

	useEffect(() => {
	if (biometricsEnabled && isMatricFilled) {
		const loginWithBiometric = async () => {
			try {
				await authPasskey(matric);
				navigate("/");
				
			} catch (error) {
				console.error("Biometric login failed", error);
			}
		};
			loginWithBiometric();
		}
	}, [biometricsEnabled]);

    const handleLogin = async (e) => {
		e.preventDefault();

		if (!isMatricFilled) {
			alert("Please enter your student matric number.");
			return;
		}

		try {
			if (biometricsEnabled) {
				await authPasskey(matric);
				navigate("/");
			} else {
				await login(matric, password)
				navigate("/");
			}
		} catch (err) {
			console.error("Login failed", err);
		}
	};


	return (
		<div className="min-h-screen relative flex items-center justify-center px-4">
			{/* Positioned image */}
			<img
				src="/assets/images/cryptovote.png"
				alt="CryptoVote Logo"
				className="absolute top-20 w-[200px] h-[200px] "
			/>

			{/* Centered form */}
			<div className="flex-grow flex items-center justify-center px-4">
				
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='max-w-md w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 backdrop-blur-xl 
					rounded-2xl shadow-xl overflow-hidden'
				>
					<div className='p-8'>
						<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-gray-500 to-gray-300 text-transparent bg-clip-text'>
							Welcome Back
						</h2>

						<form onSubmit={handleLogin}>

							<Input
								icon={User}
								type='text'
								placeholder='Student Matric'
								value={matric}
								onChange={(e) => setMatric(e.target.value)}
							/>
							<Input
								icon={Lock}
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={!isMatricFilled}
								className={`transition duration-300 ${isMatricFilled ? 'bg-gray-700' : 'bg-gray-900 opacity-50 cursor-not-allowed'}`}
							/>

							<div className='flex items-center mb-6'>
								<Link to='/forgot-password' className="text-indigo-400 hover:underline">
									Forgot password?
								</Link>
							</div>
							{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
							{/* ✅ Enable Biometrics toggle */}
							<div className="flex items-center justify-between mt-6 mb-4">
								<span className="text-white text-sm font-medium">Login using Biometrics</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={biometricsEnabled}
										onChange={() => setBiometricsEnabled(!biometricsEnabled)}
										disabled={!isMatricFilled}  // Disable toggle if matric not filled
									/>
									<div className={`w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer 
										peer-checked:bg-green-500 
										after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white 
										after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
										peer-checked:after:translate-x-full
										${!isMatricFilled ? 'opacity-50 cursor-not-allowed' : ''}`} />
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
								disabled={isLoading || (biometricsEnabled && !isMatricFilled)} // disable if biometric login chosen but matric empty
							>
								{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Login"}
							</motion.button>
						</form>
					</div>

					<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
						 <p className='text-sm text-gray-400'>
							Don't have a account?{" "}
							<Link to='/signup' className="text-indigo-400 hover:underline">
							Sign up
							</Link>
							<br />
							Or continue as a{" "}
							<Link to='/guest-signup' className="text-indigo-400 hover:underline">
							guest
							</Link>
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	)
}

export default LoginPage
