export type View = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'team';

export const viewRoutes: Record<View, string> = {
    dashboard: '/dashboard',
    clients: '/clients',
    projects: '/projects',
    tasks: '/tasks',
    team: '/team',
};