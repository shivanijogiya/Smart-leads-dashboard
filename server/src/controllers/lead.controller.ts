import mongoose from 'mongoose';
import type { SortOrder as MongooseSortOrder } from 'mongoose';
import type { Response } from 'express';
import { Lead } from '../models/lead.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import type { AuthenticatedRequest, LeadFilter, LeadQuery } from '../types.js';
import { created, ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildLeadFilter = (req: AuthenticatedRequest): LeadFilter => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const query = req.query as unknown as LeadQuery;
  const filter: LeadFilter = {};

  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const pattern = new RegExp(escapeRegExp(query.search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  if (req.user.role === 'sales') {
    filter.owner = new mongoose.Types.ObjectId(req.user.id);
  }

  return filter;
};

const assertLeadAccess = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new AppError('Lead not found', 404);
  }
  if (req.user.role !== 'admin' && lead.owner.toString() !== req.user.id) {
    throw new AppError('You can only access your own leads', 403);
  }
  return lead;
};

export const listLeads = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  const query = req.query as unknown as LeadQuery;
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter = buildLeadFilter(req);
  const sort: { createdAt: MongooseSortOrder } = { createdAt: query.sort === 'oldest' ? 1 : -1 };

  const [leads, total] = await Promise.all([
    Lead.find(filter).populate('owner', 'name email role').sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.json({
    ...ok('Leads fetched successfully', leads),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getLead = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  const lead = await assertLeadAccess(req);
  await lead.populate('owner', 'name email role');
  res.json(ok('Lead fetched successfully', lead));
});

export const createLead = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const lead = await Lead.create({
    ...req.body,
    owner: req.user.id,
  });
  res.status(201).json(created('Lead created successfully', lead));
});

export const updateLead = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  const lead = await assertLeadAccess(req);
  lead.set(req.body);
  await lead.save();
  res.json(ok('Lead updated successfully', lead));
});

export const deleteLead = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  const lead = await assertLeadAccess(req);
  await lead.deleteOne();
  res.json(ok('Lead deleted successfully', { id: req.params.id }));
});

export const exportLeads = asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
  const query = req.query as unknown as LeadQuery;
  const filter = buildLeadFilter(req);
  const sort: { createdAt: MongooseSortOrder } = { createdAt: query.sort === 'oldest' ? 1 : -1 };
  const leads = await Lead.find(filter).sort(sort).lean();

  const header = ['Name', 'Email', 'Status', 'Source', 'Created At'];
  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    lead.status,
    lead.source,
    lead.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="smart-leads.csv"');
  res.send(csv);
});
