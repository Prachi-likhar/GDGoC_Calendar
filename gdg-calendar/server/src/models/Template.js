import mongoose from 'mongoose';
import { EVENT_TYPES } from './Event.js';
import { USER_DOMAINS } from './User.js';

const templateTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    offsetDays: { type: Number, required: true },
    domain: { type: String, enum: USER_DOMAINS, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false }
);

const templateSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    offsetMinutes: { type: Number, required: true, default: 0 },
    durationMinutes: { type: Number, required: true, default: 60 },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    eventType: { type: String, enum: EVENT_TYPES, required: true },
    tasks: { type: [templateTaskSchema], default: [] },
    defaultSessions: { type: [templateSessionSchema], default: [] },
  },
  { timestamps: true }
);

export const Template = mongoose.model('Template', templateSchema);

