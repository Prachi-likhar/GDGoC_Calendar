import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    branch: { type: String, default: '', trim: true },
    year: { type: String, default: '', trim: true },
    qrToken: { type: String, required: true, unique: true },
    checkedInAt: { type: Date, default: null },
    certificateIssued: { type: Boolean, default: false },
  },
  { timestamps: true }
);

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);

