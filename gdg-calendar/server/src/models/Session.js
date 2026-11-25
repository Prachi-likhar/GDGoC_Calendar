import mongoose from 'mongoose';

export const SESSION_STATUSES = ['upcoming', 'live', 'done'];

const sessionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    day: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    speaker: {
      type: String,
      default: '',
      trim: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

sessionSchema.index({ eventId: 1, day: 1, order: 1 });

export const Session = mongoose.model('Session', sessionSchema);

