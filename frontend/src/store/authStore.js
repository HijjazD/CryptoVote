import {create} from "zustand"
import axios from "axios"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"


const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth"

axios.defaults.withCredentials=true

export const useAuthStore = create((set) => ({
    user:null,
    isAuthenticated:false,
    error:null,
    isLoading:false,
    isCheckingAuth:true,
    message: null,
    txHash: null,
    setUser: (user) => set({ user }), 
    signup: async(studentMatric) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/signup`, {studentMatric})
            set({user:response.data.user, isAuthenticated:true, isLoading:false, isCheckingAuth:false})
        } catch (error) {
            set({error:error.response.data.message || "Error signing up:", isLoading:false})
            throw error
        }
    },

    login: async(studentMatric, password) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/login`, {studentMatric, password})
            set({user:response.data.user, isAuthenticated:true, isLoading:false, error: null})
        } catch (error) {
            set({error:error.response?.data?.message || "Error login up:", isLoading:false})
            throw error
        }
    },

    verifyEmail: async (verificationCode) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {verificationCode})
            set({user:response.data.user, isAuthenticated:true, isLoading:false})
            return response.data
        } catch (error) {
            set({error:error.response.data.message || "Error signing up:", isLoading:false})
            throw error
        }
    },

    savePass: async(password, token) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/save-pass`, {password, token})
            set({user:response.data.user, isAuthenticated:true, isLoading:false})
        } catch (error) {
            set({error:error.response.data.message || "Error in saving password:", isLoading:false})
            throw error
        }
    },

    logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},

    forgotPassword: async (studentMatric) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, {studentMatric})
            set({message: response.data.message, isLoading:false})
        } catch (error) {
            set({isLoading:false, error:error.response.data.message || "Error sending reset password email:"})
            throw error
        }
    },

    resetPassword: async (token,password) => {
        set({isLoading:true, error:null})
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, {password})
            set({message: response.data.message, isLoading:false})
        } catch (error) {
            set({isLoading:false, error:error.response.data.message || "Error resetting email:"})
            throw error
        }
    },

    initPasskey: async (token) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Get challenge from server
            const response = await axios.post(`${API_URL}/init-passkey`, {token},{
                withCredentials: true
            });
            
            const data = response.data;
            console.log("Init register response:", data);

            // 2. Create passkey
            let registrationJSON
            try {
                registrationJSON = await startRegistration(data);
            } catch (error) {
                console.error("Error in startRegistration(data):", error.message);
                set({ error: error.message || "Error initializing passkey", isLoading: false });
                throw error;
            }
            console.log("registrationJSON:", registrationJSON);

            // 3. Save passkey in DB
            const verifyResponse = await axios.post(`${API_URL}/verify-passkey`, registrationJSON, {
                withCredentials: true, // Ensures cookies (like challengeCookie) are included
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const verifyData = verifyResponse.data;

            console.log("Verify register response:", verifyData);

            if (verifyData.success) {
                return { success: true, message: "uccessfully registered" };
            } else {
                throw new Error(verifyResponse.data.error || "Verification failed");
            }
        } catch (error) {
            console.error("Error in initPasskey:", error.message);
            set({ error: error.message || "Error initializing passkey", isLoading: false });
            throw error;
        }
    },

    authPasskey: async (matric) => {
        set({ isLoading: true, error: null });
        try {
            console.log("trying to get challenge from server now")
            // 1. Get challenge from server
            const response = await axios.post(`${API_URL}/auth-passkey`, {matric},{
                withCredentials: true
            });

            const options = await response.data
            if(!options){
                set({ error: error.message || "Error authenticating passkey", isLoading: false });
                return
            }

            //2. Get passkey
            const authJSON = await startAuthentication(options)

            //3. Verify passkey in DB
            const verifyResponse = await axios.post(`${API_URL}/verify-auth-passkey`, authJSON,{
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const verifyData = verifyResponse.data;

            if (!verifyData.verified) {
                set({ error: "Failed to log in with passkey", isLoading: false });
                return;
            }

            set({ user:verifyResponse.data.user, isLoading: false, error: null, isAuthenticated: true, isCheckingAuth:false });
        } catch (error) {
            set({
                error: error.response?.data?.error || error.message || "Unexpected error",
                isLoading: false,
            });
        }
    },

    voteConfirmationEmail: async (email) => {
        try {
            await axios.post(`${API_URL}/voteConfirmed`, {email})
            
        } catch (error) {
            set({error:error.response.data.message || "Error in voting:"})
            throw error
        }
    },

    claimToken: async (recipientAddress, userId) => {
        set({ isLoading: true, error: null, message: null, txHash: null });
        try {
            const response = await axios.post(`${API_URL}/claimToken`, { recipientAddress, userId });

            if (response.data && response.data.txHash) {
                set({
                    isLoading: false,
                    message: "Token claimed successfully!",
                    txHash: response.data.txHash,
                });
            } else {
                set({
                    isLoading: false,
                    error: "Token claim failed.",
                });
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error claiming token",
            });
            throw error;
        }
    },

    checkAuth: async() => {
        set({isCheckingAuth:true,error:null})
        try {
            const response = await axios.get(`${API_URL}/check-auth`)
            set({user:response.data.user, isAuthenticated:true, isCheckingAuth:false})
        } catch (error) {
            set({error:null, isCheckingAuth:false, isAuthenticated:false})
        }
    }

})
)
