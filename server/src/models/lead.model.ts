import mongoose, { Schema, type HydratedDocument } from 'mongoose';
import type { LeadSource, LeadStatus } from '../types.js';

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = HydratedDocument<ILead>;

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'],
      default: 'New',
      index: true,
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'Referral'],
      required: [true, 'Source is required'],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', email: 'text' });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
