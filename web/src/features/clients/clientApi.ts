import { apiRequest } from '../../lib/api';
import type { ClientResponse, ClientsResponse } from './types';

export function getClients(token: string) {
    return apiRequest<ClientsResponse>('/clients', {
        token,
    });
}

export function createClient(
    token: string,
    payload: {
        name: string;
        contact_name?: string;
        contact_email?: string;
        status?: 'active' | 'archived';
    },
) {
    return apiRequest<ClientResponse>('/clients', {
        method: 'POST',
        token,
        body: payload,
    });
}