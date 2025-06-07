import { User } from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { generateChallengeCookie } from '../utils/generateChallengeCookie.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail, voteConfirmationEmail } from '../smtp/emails.js'
import { generateRegistrationOptions, generateAuthenticationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { webcrypto } from 'crypto';
import {ethers, JsonRpcProvider, Wallet} from 'ethers';
import dotenv from 'dotenv'

import crypto from "crypto"
import bcryptjs from 'bcryptjs'

dotenv.config()

const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;
const RPC_URL = process.env.GANACHE_RPC_URL;
const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

if(!globalThis.crypto){
    globalThis.crypto = webcrypto
}

export const signup = async (req, res) => {
    const { studentMatric } = req.body
    const email = `${studentMatric}${process.env.STUDENT_EMAIL_DOMAIN}`;
    try {
        if(!studentMatric){
            throw new Error("All fields are required")
        }

        const userAlreadyExist = await User.findOne({studentMatric})
        if(userAlreadyExist) {
            if(userAlreadyExist.isEmailVerified) {
                return res.status(400).json({success:false, message:"User already exist"})
            }else{
                await User.findByIdAndDelete(userAlreadyExist._id)
            }
        }

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

        const user = new User({
            studentMatric,
            email,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //24hrs
        })

        await user.save()


        console.log("email sent to: ", user.email)
        console.log("verification code: ", user.verificationToken)
        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })

        console.log("Email successfully sent to: ", user.email)
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}

export const verifyEmail = async (req, res) => {
    const {verificationCode} = req.body
    console.log("im verifying this code now: ", verificationCode)
    try {
        const user = await User.findOne({
            verificationToken: verificationCode,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }

        console.log("Email successfully verified")
        console.log("im creating pass token now")

        const createPassToken = crypto.randomBytes(20).toString("hex")
        const createPassTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.resetPasswordToken = createPassToken
        user.resetPasswordExpiresAt = createPassTokenExpiresAt
        await user.save()
        generateTokenAndSetCookie(res,user._id)
        await sendWelcomeEmail(user.email)

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}

export const savePass = async (req, res) => {
    console.log("im trying to save password now...")
    const {password, token} = req.body

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }
        const hashedPassword = await bcryptjs.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })

    } catch (error) {
        console.log("Error in resetPassword: ", error)
        res.status(400).json({ success: false, message: error.message })
    }
    
}

export const initPasskey = async (req, res) => {
    try {
        const {token} = req.body
        console.log("user's token use to start webauth: ", token)

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }

        console.log("successfully find user")

        let data

        try {
            data = await generateRegistrationOptions({
                rpID: process.env.RPID,
                rpName: process.env.RPNAME,
                userName: user.studentMatric,
                displayName: user.email,
            })
        } catch (error) {
            console.log("error in generatingRegistrationOptions: ", error)
        }

        console.log("data: ", data)

        generateChallengeCookie(res,user.email,data.user,data.challenge);

        console.log("done cookie")
        res.json(data)
    } catch (error) {
        res.status(400).json({ message: error.message});
    }
}

export const verifyPasskey = async (req,res) => {
    try {
        console.log("Im verifying this guy passkey now ...")
        console.log("Here is the cookie i retrieved: ", req.cookies.challengeCookie)
        const regInfo = JSON.parse(req.cookies.challengeCookie)
        if(!regInfo){
            return res.status(400).json({ error: "Registration info not found"})
        }

        console.log("challenge from regInfo: ", regInfo.challenge)

        console.log("response: ", req.body)

        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge: regInfo.challenge,
            expectedOrigin: process.env.CLIENT_URL,
            expectedRPID: process.env.RPID
        })

        console.log("ive verified this man ...")
        console.log("Email inside regInfo: ", regInfo.email)

        if (!verification.verified) {
            return res.status(400).json({ success: false, message: "Passkey verification failed" });
        }

        // Find the user
        const user = await User.findOne({ email: regInfo.email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("id : ", verification.registrationInfo.credentialID)
        console.log("public key : ", verification.registrationInfo.credentialPublicKey.toString("base64"))
        console.log("transport inside verification: ", verification.registrationInfo.credentialTransport)
        console.log("transport inside req.body: ", req.body.response.transports)
        // Update user's credentials directly using verification data
        user.credentials = [{
            id: verification.registrationInfo.credentialID,
            publicKey: verification.registrationInfo.credentialPublicKey.toString("base64"),
            counter: verification.registrationInfo.counter,
            deviceType: verification.registrationInfo.credentialDeviceType,
            backedUp: verification.registrationInfo.credentialBackedUp,
            transport: req.body.response.transports
        }];

        console.log("Saving user:", user);

        await user.save()
            .then(() => console.log("User saved successfully!"))
            .catch(err => console.error("Error saving user:", err));


        console.log("Passkey verification successful! User credentials updated.");
        res.clearCookie("challengeCookie")
        res.status(200).json({
            success: true,
            message: "Passkey verified and credentials updated",
        });
    } catch (error) {
        console.error("Error in verification:", error.message);
        return res.status(500).json({ verified: false, error: error.message });
    }
}

export const login = async (req, res) => {
    const {studentMatric, password} = req.body

    try{
        const user = await User.findOne({studentMatric});
        if(!user){
            return res.status(400).json({success:false, message: "Invalid credentials"})
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({success:false, message: "Invalid credentials"})
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date()
        await user.save()

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    }catch(error){
        console.log("Error in log in: ", error)
        res.status(400).json({ success: false, message: error.message})
    }
}

export const authPasskey = async (req, res) => {
    console.log("im in auth passkey now.....")
    const {matric} = req.body
    console.log("retrieved matric number: ", matric)

    const user = await User.findOne({
        studentMatric: matric
    })

    if(!user){
        return res.status(400).json({success: false, message: "Invalid Matric Number"})
    }
    // ✅ Check if the user has any biometric credentials registered
    if (!user.credentials || user.credentials.length === 0) {
        return res.status(400).json({
            success: false,
            error: "No biometric credentials found. Please login using password."
        });
    }

    console.log("successfully find student with matric number: ", matric)

    const allowCredentials = user.credentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transport,
    }));

    const options = await generateAuthenticationOptions({
        rpID: process.env.RPID,
        allowCredentials
    })

    generateChallengeCookie(res,user.email,user.id,options.challenge);
    

    res.json(options)
}

export const verifyAuthPasskey = async (req, res) => {
    console.log("im in verifyAuthPasskey now...")
    const authInfo = JSON.parse(req.cookies.challengeCookie)

    if(!authInfo){
        return res.status(400).json({ error: "Authentication info not found"})
    }
    console.log("successfully retrieve challengeCookie....")
    console.log("trying to find user by user id from coookie: ", authInfo)
    const user = await User.findById(authInfo.userId)
    

    console.log("successfully find user...")

    console.log("this is what i retrieve from body: ", req.body)

    //const credential = user.credentials
    
    // Find the matching credential from the user's stored credentials
    const credential = user.credentials.find(
        cred => cred.id === req.body.id
    );
    console.log("credentials: ", credential)

    if (!credential) {
        return res.status(400).json({ error: "Credential not found" });
    }
    let verification
    try {
        verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: authInfo.challenge,
            expectedOrigin: process.env.CLIENT_URL, // e.g., "https://yourfrontend.com"
            expectedRPID: process.env.RPID, // e.g., "yourdomain.com"
            authenticator: {
                credentialID: credential.id,
                credentialPublicKey: Uint8Array.from(credential.publicKey.split(',')),
                counter: credential.counter,
                transports: credential.transport || [], // optional
            },

        });
    } catch (error) {
        console.log("error in verifyAuthenticationResponse")
        return res.status(400).json({ error: error.message || "Verification failed" });
    }

    console.log("successfuly run verifyAuthenticationResponse")
    console.log("verification result: ", verification);

    // Update the signature counter
    if (verification.verified) {
    
        credential.counter = verification.authenticationInfo.newCounter

        try {
            generateTokenAndSetCookie(res, user._id);

            user.lastLogin = new Date()
            await user.save(); // Save updated counter
        } catch (err) {
            console.error("Error saving user with new counter:", err);
            return res.status(500).json({ verified: false, error: "Failed to update counter" });
        }

        // Clear challenge and respond
        res.clearCookie("challengeCookie");
        return res.json({ 
            verified: true,
            user: {
                ...user._doc,
                password: undefined
            } 
        });
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({success:true, message:"Logged out successfully"})
}

export const forgotPassword = async (req, res) => {
    const { studentMatric } = req.body;
    try {
        const user = await User.findOne({studentMatric})
        if(!user){
            res.status(400).json({success:false, message:"User not found"})
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt
        await user.save()

        console.log("resetToken", resetToken)
        //send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({ success: true, message: "Password reset link sent to your email" })
    } catch (error) {
        console.log("Error in forgot password", error)
        res.status(400).json({success:false, message: error.message})
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
        }

        const hashedPassword = await bcryptjs.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()

        await sendResetSuccessEmail(user.email)
        console.log("congrats you have successfully reset ur password: ", password)
        res.status(200).json({ success: true, message: "Password reset successfully" })

    } catch (error) {
        console.log("Error in resetPassword: ", error)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const sendVoteConfirmationEmail = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({email});
        user.hasVoted = true
        await voteConfirmationEmail(email)
        await user.save()
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}

export const claimToken = async(req, res) => {
    try {
        const { recipientAddress, userId } = req.body;

        if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
        return res.status(400).json({ error: 'Invalid recipient address' });
        }

        const tx = await wallet.sendTransaction({
            to: recipientAddress,
            value: ethers.parseEther("500"), // amount of Ganache ETH to send
        });

        await tx.wait();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.publicAddress=recipientAddress
        user.hasClaim=true

        await user.save()

        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("Faucet error:", err);
        res.status(500).json({ error: 'Faucet failed' });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({success:false, message:"user not found"})
        }

        res.status(200).json({
            success:true,
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log("Error in checkAuth ", error)
        res.status(400).json({success:false, message:error.message})
    }
}
