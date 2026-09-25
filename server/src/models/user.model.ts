import { Schema, model } from 'mongoose';

export interface IUser {
  clerkId: string;
  email?: string;
  name?: string;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: String,
    name: String,
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);