import mongoose from "mongoose";

const credentials = new mongoose.Schema({
    id: { type: String, required: true }, // Credential ID
    publicKey: { type: String, required: true }, // Public Key
    counter: { type: Number, required: true }, // Authentication counter
    deviceType: { type: String, required: true }, // Device type (e.g., cross-platform, platform)
    backedUp: { type: Boolean, required: true }, // Whether credential is backed up
    transport: { type: [String], required: true } // Transport methods (e.g., ["usb", "nfc"])
});

const userSchema = new mongoose.Schema({
    studentMatric:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: false,
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    credentials: { type: [credentials], default: [] }, 
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
},{timestamps: true});

export const User = mongoose.model('User', userSchema);