import mongoose from 'mongoose';

export const EVENT_TYPES = [
  'workshop',
  'talk',
  'hackathon',
  'study_jam',
  'series',
  'meetup',
  'other',
];

export const EVENT_STATUSES = [
  'idea',
  'planned',
  'confirmed',
  'ongoing',
  'done',
  'cancelled',
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    venue: {
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
      validate: {
        validator(value) {
          return !this.startAt || value > this.startAt;
        },
        message: 'endAt must be after startAt',
      },
    },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: 'idea',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posterUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    registrationOpen: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
      min: 1,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ startAt: 1, endAt: 1 });

export const Event = mongoose.model('Event', eventSchema);
