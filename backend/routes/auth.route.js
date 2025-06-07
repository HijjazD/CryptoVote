import express from "express"

import { signup, savePass , login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, initPasskey, verifyPasskey, authPasskey, verifyAuthPasskey,sendVoteConfirmationEmail, claimToken } from "../controller/auth.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();



router.post("/signup", signup)

router.post("/save-pass", savePass)

router.post("/verify-email", verifyEmail)

router.post("/init-passkey", initPasskey)

router.post("/verify-passkey", verifyPasskey)

router.post("/auth-passkey", authPasskey)

router.post("/verify-auth-passkey", verifyAuthPasskey)

router.post("/login", login)

router.post("/logout", logout)

router.post("/forgot-password", forgotPassword)

router.post("/reset-password/:token", resetPassword);

router.post("/voteConfirmed", sendVoteConfirmationEmail)

router.post("/claimToken", claimToken)

router.get("/check-auth", verifyToken , checkAuth)



export default router
