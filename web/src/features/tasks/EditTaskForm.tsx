import {type FormEvent, useState} from "react";
import type { Task, TaskPriority, TaskStatus } from "./types.ts";
import type { Project } from "../projects/types.ts";
import { updateTask } from "./taskApi.ts";
import { useNavigate } from 'react-router-dom';

type EditTaskFormProps = {
    task: Task;
    projects: Project[];
    token: string | null;
    onTaskUpdated: (task: Task) => void;
};

export function EditTaskForm( { task, projects, token, onTaskUpdated }: EditTaskFormProps) {

    const navigate = useNavigate();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? '');
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [dueDate, setDueDate] = useState(task.due_date?.slice(0, 10) ?? '');
    const [projectId, setProjectId] = useState(String(task.project_id));
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setSaveError(null);
        setSaved(false);

        if (!token) {
            setSaveError('Please sign in to save this task');
            return;
        }

        setSaving(true);

        try {
            const response = await updateTask(token, task.id, {
                project_id: Number(projectId),
                title,
                description: description.trim() === '' ? null : description,
                status,
                priority,
                due_date: dueDate || null,
            });

            //setSaved(true);
            onTaskUpdated(response.task);
            navigate('/tasks');

        } catch (error) {
            setSaveError(
                error instanceof Error ? error.message : 'Unable to save task'
            );
        } finally {
            setSaving(false);
        }

    }

    return (
        <form className="form-grid" onSubmit={handleSubmit} onChange={() => setSaved(false)}>

            <div className="form-row">
                <label htmlFor="edit_task_project">Project</label>
                <select
                    id="edit_task_project"
                    className="select"
                    value={projectId}
                    onChange={
                    (event) => setProjectId(event.target.value)
                    }
                    required
                >

                <option value="">Select a project</option>

                {projects.map( (project) => (
                    <option key={project.id} value={project.id}>
                        {project.name}
                    </option>
                ))}

                </select>

            </div>

            <div className="form-row">
                <label htmlFor="edit_task_title">Task title</label>
                <input
                    id="edit_task_title"
                    className="input"
                    value={title}
                    onChange={
                        (event) => setTitle(event.target.value)
                    }
                    maxLength={255}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="edit-task-description">Description</label>
                <textarea
                    id="edit-task-description"
                    className="textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>

            <div className="form-row">
                <label htmlFor="edit-task-priority">Priority</label>
                <select
                    id="edit-task-priority"
                    className="select"
                    value={priority}
                    onChange={(event) =>
                        setPriority(event.target.value as TaskPriority)
                    }
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="edit-task-status">Status</label>
                <select
                    id="edit-task-status"
                    className="select"
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value as TaskStatus)
                    }
                >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="edit-task-due-date">Due date</label>
                <input
                    id="edit-task-due-date"
                    className="input"
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                />
            </div>

            {saveError && (
                <p className="error">{saveError}</p>
            )}

            {saved && (
                <p role='status'>Task saved successfully.</p>
            )}

            <button type="submit" className="button" disabled={saving}>
                {saving ? 'Saving...' : 'Save task'}
            </button>

        </form>
    )
}
