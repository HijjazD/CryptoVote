import FloatingShape from "./components/FloatingShape"
import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import EmailVerificationPage from "./pages/EmailVerificationPage"
import PassPage from "./pages/PassPage"
import PollDetailsPage from "./pages/PollDetailsPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import LoadingSpinner from "./components/LoadingSpinner"
import ResetPasswordPage from "./pages/ResetPasswordPage"

import { useAuthStore } from "./store/authStore"
import { useEffect } from "react"
import { checkWallet } from "./services/blockchain"



//Protect route that require authentication
const ProtectedRoute = ({children}) => {

  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
 

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }
  if(!isAuthenticated){
    return <Navigate to="/login" replace/>
  }

  if(!user.isEmailVerified){
    return <Navigate to="/verify-email" replace/>
  }

  return children
}

//redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({children}) => {
  const {isAuthenticated, user} = useAuthStore()

  if(isAuthenticated && user?.isEmailVerified){
    return <Navigate to="/" replace/>
  }

  return children
}

function App() {
  const {checkAuth} = useAuthStore()

  useEffect(() => {
    checkAuth()
    checkWallet()
  },[checkWallet, checkAuth])


  return (
    <div className='min-h-screen bg-gradient-to-br
    from-gray-600 via-gray-800 to-rose-900 relative overflow-hidden'>

      <FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />
      <FloatingShape color='bg-yellow-500' size='w-32 h-32' top='50%' left='70%' delay={2} />
      <div className="relative z-10">
        <Routes>
          <Route path='/' element={
              <ProtectedRoute>
                <HomePage/>
              </ProtectedRoute>
            }
          />
          <Route path='/signup' element={
              <RedirectAuthenticatedUser>
                <SignUpPage/>
              </RedirectAuthenticatedUser>
            }
          />
          <Route path='/login' element={
              <RedirectAuthenticatedUser>
                <LoginPage/>
              </RedirectAuthenticatedUser>
            }
          />
          <Route path='/verify-email' element={<EmailVerificationPage />} />
          <Route path='/create-pass/:token' element={<PassPage />} />
          <Route path='/polls/:id' element={
              <ProtectedRoute>
                <PollDetailsPage/>
              </ProtectedRoute>
            }
          /> 
          <Route path='/forgot-password' element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage/>
              </RedirectAuthenticatedUser>
            }
          />

          <Route path='/reset-password/:token' element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage/>
              </RedirectAuthenticatedUser>
            }
          />
          <Route path='*' element={<Navigate to='/' replace/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App
