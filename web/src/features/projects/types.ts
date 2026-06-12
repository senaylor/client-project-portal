export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export type ProjectClient = {
    id: number;
    name: string;
};

export type Project = {
    id: number;
    organisation_id: number;
    client_id: number;
    created_by: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    client?: ProjectClient;
};

export type ProjectsResponse = {
    projects: Project[];
};

export type ProjectResponse = {
    project: Project;
};