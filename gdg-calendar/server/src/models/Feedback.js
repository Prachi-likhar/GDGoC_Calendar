import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    liked: { type: String, default: '', trim: true },
    improve: { type: String, default: '', trim: true },
    comments: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);

