import { apiRequest } from '../../lib/api';
import type { AuthResponse, MeResponse } from './types';

export function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}) {
    return apiRequest<AuthResponse>('/register', {
        method: 'POST',
        body: payload,
    });
}

export function login(payload: {
    email: string;
    password: string;
}) {
    return apiRequest<AuthResponse>('/login', {
        method: 'POST',
        body: payload,
    });
}

export function getMe(token: string) {
    return apiRequest<MeResponse>('/me', {
        token,
    });
}

export function logout(token: string) {
    return apiRequest<{ message: string }>('/logout', {
        method: 'POST',
        token,
    });
}