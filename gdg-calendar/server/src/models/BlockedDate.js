import mongoose from 'mongoose';

export const BLOCKED_REASONS = ['exam', 'holiday', 'college_event'];

const blockedDateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'endDate must be on or after startDate',
      },
    },
    reason: {
      type: String,
      enum: BLOCKED_REASONS,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

blockedDateSchema.index({ startDate: 1, endDate: 1 });

export const BlockedDate = mongoose.model('BlockedDate', blockedDateSchema);

