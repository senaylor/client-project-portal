import { apiRequest } from '../../lib/api.ts';
import type { DashboardResponse } from './types';

export function getDashboard(token: string) {
    return apiRequest<DashboardResponse>('/dashboard', {
        token
    });
}