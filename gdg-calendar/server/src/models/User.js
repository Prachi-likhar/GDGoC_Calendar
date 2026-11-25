import mongoose from 'mongoose';

export const USER_ROLES = ['admin', 'domain_head', 'member'];
export const USER_DOMAINS = ['tech', 'design', 'pr', 'content', 'logistics', 'outreach'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'member',
    },
    domain: {
      type: String,
      enum: USER_DOMAINS,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);

