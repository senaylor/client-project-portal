import type { Task } from '../tasks/types';

export type DashboardSummary = {
    total_clients: number;
    active_projects: number;
    open_tasks: number;
    overdue_tasks: number;
};

export type DashboardResponse = {
    summary: DashboardSummary;
    recent_tasks: Task[];
};