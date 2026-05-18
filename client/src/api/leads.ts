import { api } from './http';
import type { ApiEnvelope, Lead, LeadFilters, LeadListResponse, LeadPayload } from '@/types';

const buildParams = (filters: LeadFilters): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    sort: filters.sort,
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.search?.trim()) params.search = filters.search.trim();
  return params;
};

export const leadApi = {
  list: async (filters: LeadFilters): Promise<LeadListResponse> => {
    const response = await api.get<LeadListResponse>('/leads', { params: buildParams(filters) });
    return response.data;
  },

  get: async (id: string): Promise<Lead> => {
    const response = await api.get<ApiEnvelope<Lead>>(`/leads/${id}`);
    return response.data.data;
  },

  create: async (payload: LeadPayload): Promise<Lead> => {
    const response = await api.post<ApiEnvelope<Lead>>('/leads', payload);
    return response.data.data;
  },

  update: async (id: string, payload: LeadPayload): Promise<Lead> => {
    const response = await api.put<ApiEnvelope<Lead>>(`/leads/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  exportCsv: async (filters: LeadFilters): Promise<Blob> => {
    const response = await api.get('/leads/export', {
      params: buildParams(filters),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
