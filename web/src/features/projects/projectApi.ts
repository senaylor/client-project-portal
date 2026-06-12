import { apiRequest } from '../../lib/api';
import type { ProjectResponse, ProjectsResponse, ProjectStatus } from './types';

export function getProjects(token: string) {
    return apiRequest<ProjectsResponse>('/projects', {
        token,
    });
}

export function createProject(
    token: string,
    payload: {
        client_id: number;
        name: string;
        description?: string;
        status?: ProjectStatus;
        due_date?: string;
    },
) {
    return apiRequest<ProjectResponse>('/projects', {
        method: 'POST',
        token,
        body: payload,
    });
}