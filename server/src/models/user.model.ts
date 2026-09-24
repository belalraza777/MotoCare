import { Schema, model } from 'mongoose';

// Define the User schema
const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  email: String,
  name: String,
}, { timestamps: true });


export const User = model('User', userSchema);