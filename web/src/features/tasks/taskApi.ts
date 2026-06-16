import { apiRequest } from '../../lib/api';
import type { TaskPriority, TaskResponse, TasksResponse, TaskStatus } from './types';

export function getTasks(token: string) {
    return apiRequest<TasksResponse>('/tasks', {
        token,
    });
}

export function createTask(
    token: string,
    payload: {
        project_id: number;
        assigned_to?: number | null;
        title: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        due_date?: string;
    },
) {
    return apiRequest<TaskResponse>('/tasks', {
        method: 'POST',
        token,
        body: payload,
    });
}