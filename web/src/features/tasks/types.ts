export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskProjecClient = {
  id: number;
  name: string;
};

export type TaskProject = {
    id: number;
    name: string;
    client?: TaskProjecClient;
};

export type TaskAssignee = {
    id: number;
    name: string;
    email: string;
};

export type Task = {
    id: number;
    organisation_id: number;
    project_id: number;
    created_by: number;
    assigned_to: number | null;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    project?: TaskProject;
    assignee?: TaskAssignee;
};

export type TasksResponse = {
    tasks: Task[];
};

export type TaskResponse = {
    task: Task;
};