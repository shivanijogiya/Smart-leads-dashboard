import { Router } from 'express';
import {
  createLead,
  deleteLead,
  exportLeads,
  getLead,
  listLeads,
  updateLead,
} from '../controllers/lead.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createLeadSchema,
  leadParamsSchema,
  leadQuerySchema,
  updateLeadSchema,
} from '../validators/lead.validator.js';

export const leadRouter = Router();

leadRouter.use(protect);
leadRouter.get('/', validate(leadQuerySchema), listLeads);
leadRouter.get('/export', validate(leadQuerySchema), exportLeads);
leadRouter.post('/', validate(createLeadSchema), createLead);
leadRouter.get('/:id', validate(leadParamsSchema), getLead);
leadRouter.put('/:id', validate(updateLeadSchema), updateLead);
leadRouter.delete('/:id', validate(leadParamsSchema), deleteLead);
