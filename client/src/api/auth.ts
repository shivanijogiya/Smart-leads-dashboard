import { api } from './http';
import type { ApiEnvelope, AuthResponse, User, UserRole } from '@/types';

export const authApi = {
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<AuthResponse> => {
    const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<ApiEnvelope<User>>('/auth/me');
    return response.data.data;
  },
};
