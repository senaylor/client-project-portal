import type { FormEvent } from 'react';

import type { Project } from '../features/projects/types';
import type { Task } from '../features/tasks/types';

type TaskPriority = 'low' | 'medium' | 'high';

type TasksPageProps = {
    tasks: Task[];
    projects: Project[];

    taskProjectId: string;
    taskTitle: string;
    taskDescription: string;
    taskPriority: TaskPriority;
    taskDueDate: string;
    taskError: string | null;

    onTaskProjectIdChange: (value: string) => void;
    onTaskTitleChange: (value: string) => void;
    onTaskDescriptionChange: (value: string) => void;
    onTaskPriorityChange: (value: TaskPriority) => void;
    onTaskDueDateChange: (value: string) => void;
    onCreateTask: (event: FormEvent<HTMLFormElement>) => void;
};

export function TasksPage({
                              tasks,
                              projects,
                              taskProjectId,
                              taskTitle,
                              taskDescription,
                              taskPriority,
                              taskDueDate,
                              taskError,
                              onTaskProjectIdChange,
                              onTaskTitleChange,
                              onTaskDescriptionChange,
                              onTaskPriorityChange,
                              onTaskDueDateChange,
                              onCreateTask,
}: TasksPageProps) {
    return (
        <section className="content-card" id="tasks">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Tasks</h3>
                    <p className="card-description">
                        Break projects into actionable work items.
                    </p>
                </div>

                <span className="badge">{tasks.length}</span>
            </div>

            {projects.length === 0 ? (
                <p className="empty-state">Create a project before adding tasks.</p>
            ) : (
                <form onSubmit={onCreateTask} className="form-grid">
                    <div className="form-row">
                        <label htmlFor="task-project">Project</label>
                        <select
                            id="task-project"
                            className="select"
                            value={taskProjectId}
                            onChange={(event) => onTaskProjectIdChange(event.target.value)}
                            required
                        >
                            <option value="">Select a project</option>

                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                    {project.client ? ` — ${project.client.name}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="task-title">Task title</label>
                        <input
                            id="task-title"
                            className="input"
                            value={taskTitle}
                            onChange={(event) => onTaskTitleChange(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="task-description">Description</label>
                        <textarea
                            id="task-description"
                            className="textarea"
                            value={taskDescription}
                            onChange={(event) => onTaskDescriptionChange(event.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="task-priority">Priority</label>
                        <select
                            id="task-priority"
                            className="select"
                            value={taskPriority}
                            onChange={(event) =>
                                onTaskPriorityChange(event.target.value as 'low' | 'medium' | 'high')
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="task-due-date">Due date</label>
                        <input
                            id="task-due-date"
                            className="input"
                            type="date"
                            value={taskDueDate}
                            onChange={(event) => onTaskDueDateChange(event.target.value)}
                        />
                    </div>

                    {taskError && <p className="error-message">{taskError}</p>}

                    <button type="submit" className="button">
                        Add task
                    </button>
                </form>
            )}

            <hr />

            {tasks.length === 0 ? (
                <p className="empty-state">No tasks yet.</p>
            ) : (
                <ul className="list">
                    {tasks.map((task) => (
                        <li key={task.id} className="list-item">
                            <div className="list-item-title">{task.title}</div>
                            <div className="list-item-meta">
                                {projects.find((project) => project.id === task.project_id)?.name
                                    ?? 'No project'}
                            </div>

                            <div>
                                <span className="badge">{task.status}</span>{' '}
                                <span
                                    className={
                                        task.priority === 'high'
                                            ? 'badge danger'
                                            : task.priority === 'medium'
                                                ? 'badge warning'
                                                : 'badge'
                                    }
                                >
                                                        {task.priority}
                                                    </span>
                            </div>

                            {task.due_date && (
                                <div className="list-item-meta">
                                    Due {task.due_date.slice(0, 10)}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}