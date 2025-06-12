import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
	WELCOME_EMAIL_TEMPLATE,
	VOTE_CONFIRMATION_TEMPLATE
	
} from "./emailTemplates.js";


import { transporter } from "../nodemailer/smtp.config.js";
import dotenv from 'dotenv'

dotenv.config()

const EMAIL_USER = process.env.EMAIL_CUSTOM_DOMAIN


export const sendVerificationEmail = async (email, verificationToken) => {
	try {
		const response = await transporter.sendMail({
			from: `"CryptoVote" <${EMAIL_USER}>`,
			to: email,  
			subject: "Email Verification",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
		})

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async(email) => {
	

	try {
		const response = await transporter.sendMail({
			from: `"CryptoVote" <${EMAIL_USER}>`,
			to: email,  
			subject: "Welcome to CryptoVote!",
			html: WELCOME_EMAIL_TEMPLATE,
		})
		console.log("Welcome Email sent successfully", response)

	} catch (error) {
		console.log(`Error sending welcome email `, error)

		throw new Error(`Error sending welcome email: ${error}`)
	}
}

export const sendPasswordResetEmail = async(email, resetURL) => {
	try {
		const response = await transporter.sendMail({
			from: `"CryptoVote" <${EMAIL_USER}>`,
			to: email,  
			subject: "Password Reset Email",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
		})

		console.log("Password Email sent successfully", response)
	} catch (error) {
		console.log(`Error sending reset email`, error)
		throw new Error(`Error sending password reset email: ${error}`)
	}
}

export const sendResetSuccessEmail = async (email) => {

	try {
		const response = await transporter.sendMail({
			from: `"CryptoVote" <${EMAIL_USER}>`,
			to: email,  
			subject: "Password Reset Success Email",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
		})

		console.log("Password Reset Success Email sent successfully", response)
	} catch (error) {
		console.log(`Error sending password reset success email`, error)
		throw new Error(`Error sending password reset success email: ${error}`)
	}
}

export const voteConfirmationEmail = async (email) => {

	try {
		const response = await transporter.sendMail({
			from: `"CryptoVote" <${EMAIL_USER}>`,
			to: email,  
			subject: "Vote Confirmation Email",
			html: VOTE_CONFIRMATION_TEMPLATE,
		})

		console.log("Password Reset Success Email sent successfully", response)
	} catch (error) {
		console.log(`Error sending password reset success email`, error)
		throw new Error(`Error sending password reset success email: ${error}`)
	}
}
   
