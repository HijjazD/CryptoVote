const Input = ({ icon: Icon, className='',...props }) => {
	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-gray-500' />
			</div>
			<input
				{...props}
				className={`w-full pl-10 pr-3 py-2 rounded-lg border transition duration-200
					bg-gray-800 bg-opacity-50 border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 
					text-white placeholder-gray-400 ${className}`}
			/>
		</div>
	);
};
export default Input;