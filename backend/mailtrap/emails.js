import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";


    
export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async(email) => {
	const recipient = [{email}]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "94ec3ccf-6798-4a90-acbc-cdfb33e6d65c",
    		template_variables: {
				"company_info_name": "CryptoVote",
				"name": email,
    		}
		})

		console.log("Welcome Email sent successfully", response)

	} catch (error) {
		console.log(`Error sending welcome email `, error)

		throw new Error(`Error sending welcome email: ${error}`)
	}
}

export const sendPasswordResetEmail = async(email, resetURL) => {
	const recipient = [{email}]
	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Password Reset"
		})
		console.log("Password Email sent successfully", response)
	} catch (error) {
		console.log(`Error sending reset email`, error)
		throw new Error(`Error sending password reset email: ${error}`)
	}
}

export const sendResetSuccessEmail = async (email) => {
	const recipient = [{email}]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Password Reset"
		})
		console.log("Password Reset Success Email sent successfully", response)
	} catch (error) {
		console.log(`Error sending password reset success email`, error)
		throw new Error(`Error sending password reset success email: ${error}`)
	}
}
   