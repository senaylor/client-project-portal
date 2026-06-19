import { apiRequest } from '../../lib/api';
import type { TeamMemberResponse, TeamResponse, TeamRole } from './types';

export function getTeam(token: string) {
    return apiRequest<TeamResponse>('/team', {
        token,
    });
}

export function addTeamMember(
    token: string,
    payload: {
        email: string;
        role: Exclude<TeamRole, 'owner'>;
    },
) {
    return apiRequest<TeamMemberResponse>('/team', {
        method: 'POST',
        token,
        body: payload,
    });
}

export function updateTeamMemberRole(
    token: string,
    userId: number,
    payload: {
        role: Exclude<TeamRole, 'owner'>;
    },
) {
    return apiRequest<TeamMemberResponse>(`/team/${userId}`, {
        method: 'PATCH',
        token,
        body: payload,
    });
}

export function removeTeamMember(token: string, userId: number) {
    return apiRequest<{ message: string }>(`/team/${userId}`, {
        method: 'DELETE',
        token,
    });
}