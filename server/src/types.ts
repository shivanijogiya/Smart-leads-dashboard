import type { Request } from 'express';
import type { Types } from 'mongoose';

export type UserRole = 'admin' | 'sales';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type SortOrder = 'latest' | 'oldest';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface LeadQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: SortOrder;
  page: number;
  limit: number;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  owner?: Types.ObjectId;
  $or?: Array<{ name?: RegExp; email?: RegExp }>;
}
