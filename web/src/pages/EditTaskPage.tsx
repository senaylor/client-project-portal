import {Link, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import { getTask } from "../features/tasks/taskApi.ts";
import type { Task } from "../features/tasks/types.ts";
import { EditTaskForm } from "../features/tasks/EditTaskForm.tsx";
import type { Project } from "../features/projects/types.ts"

type EditTaskPageProps = {
    token: string | null;
    projects: Project[];
    onTaskUpdated: (task: Task) => void;
};

export function EditTaskPage({ token, projects, onTaskUpdated }: EditTaskPageProps) {
    const { taskId } = useParams<{ taskId: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadTask() {
            setLoading(true);
            setError(null);
            setTask(null);

            try {
                const id = Number(taskId);

                if (!Number.isSafeInteger(id) || id <= 0)
                    throw new Error('Invalid task ID.');

                if (!token)
                    throw new Error('Please sign into edit this task.');

                const response = await getTask(token, id);

                if (!cancelled) {
                    setTask(response.task)
                }
            } catch (error) {
                if (!cancelled) {
                    setError(
                        error instanceof Error ? error.message : 'Unable to load task.',
                        );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadTask();

        return() => {
            cancelled = true;
        };

    }, [taskId, token]);

    return (
        <section className="content-card">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Edit task</h3>
                    <p className="card-description">Editing task {taskId}</p>
                </div>

                <Link
                    to="/tasks" className="button secondary">
                    Cancel
                </Link>
            </div>

            {loading && <p role="status">Loading task...</p>}

            {error && <p className="error-message" role="alert">
                {error}
            </p>}

            {!loading && !error && task && (
                <EditTaskForm
                    key={task.id}
                    task={task}
                    projects={projects}
                    token={token}
                    onTaskUpdated={onTaskUpdated}
                />
            )}

        </section>
    )
}