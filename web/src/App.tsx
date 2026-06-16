import { useEffect, useState } from 'react'; //runtime value
import type { FormEvent } from 'react'; //TypeScript-only type
import { getCurrentOrganisation } from './features/organisations/organisationApi';
import { createClient, getClients } from './features/clients/clientApi';
import { createProject, getProjects } from './features/projects/projectApi';
import { createTask, getTasks } from './features/tasks/taskApi.ts';

import {
    getMe,
    login,
    logout,
    register,
} from './features/auth/authApi';

import type { User, Organisation } from './features/auth/types';
import type { Client } from './features/clients/types';
import type { Project } from './features/projects/types';
import type { Task } from './features/tasks/types'

const TOKEN_STORAGE_KEY = 'cpp_auth_token';

function App() {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem(TOKEN_STORAGE_KEY),
    );

    const [user, setUser] = useState<User | null>(null);

    const [organisation, setOrganisation] = useState<Organisation | null>(null);

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('Tom Denver');
    const [email, setEmail] = useState('tom@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clients, setClients] = useState<Client[]>([]);
    const [clientName, setClientName] = useState('');
    const [clientContactName, setClientContactName] = useState('');
    const [clientContactEmail, setClientContactEmail] = useState('');
    const [clientError, setClientError] = useState<String | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectClientId, setProjectClientId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectDueDate, setProjectDueDate] = useState('');
    const [projectError, setProjectError] = useState<String | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskProjectId, setTaskProjectId] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskError, setTaskError] = useState<string | null>(null);

    function saveToken(nextToken: string) {
        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        setToken(nextToken);
    }

    function clearAuth() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setOrganisation(null);
        setClients([]);
        setProjects([]);
        setTasks([]);
    }

    useEffect(() => {
        if (!token) {
            return;
        }

        Promise.all([
            getMe(token),
            getCurrentOrganisation(token),
            getClients(token),
            getProjects(token),
            getTasks(token),
        ])
            .then(([meResponse, organisationResponse, clientsResponse, projectsResponse, tasksResponse]) => {
                setUser(meResponse.user);
                setOrganisation(organisationResponse.organisation);
                setClients(clientsResponse.clients);
                setProjects(projectsResponse.projects);
                setTasks(tasksResponse.tasks);
            })
            .catch(() => {
                clearAuth();
            });
    }, [token]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const response =
                mode === 'register'
                    ? await register({
                        name,
                        email,
                        password,
                        password_confirmation: password,
                    })
                    : await login({
                        email,
                        password,
                    });

            saveToken(response.token);
            setUser(response.user);
            if (response.organisation) {
                setOrganisation(response.organisation);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        if (!token) {
            clearAuth();
            return;
        }

        try {
            await logout(token);
        } finally {
            clearAuth();
        }
    }

    async function handleCreateClient(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            return;
        }

        setClientError(null);

        try {
            const response = await createClient(token, {
                name: clientName,
                contact_name: clientContactName || undefined,
                contact_email: clientContactEmail || undefined,
                status: 'active',
            });

            setClients((currentClients) => [response.client, ...currentClients]);
            setProjectClientId(String(response.client.id));

            setClientName('');
            setClientContactName('');
            setClientContactEmail('');
        } catch (error) {
            setClientError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            return;
        }

        setProjectError(null);

        try {
            const response = await createProject(token, {
                client_id: Number(projectClientId),
                name: projectName,
                description: projectDescription || undefined,
                status: 'active',
                due_date: projectDueDate || undefined,
            });

            setProjects((currentProjects) => [response.project, ...currentProjects]);
            setTaskProjectId(String(response.project.id));

            setProjectName('');
            setProjectDescription('');
            setProjectDueDate('');
        } catch (error) {
            setProjectError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            return;
        }

        setTaskError(null);

        try {
            const response = await createTask(token, {
                project_id: Number(taskProjectId),
                title: taskTitle,
                description: taskDescription || undefined,
                status: 'todo',
                priority: taskPriority,
                due_date: taskDueDate || undefined,
            });

            setTasks((currentTasks) => [response.task, ...currentTasks]);

            setTaskTitle('');
            setTaskDescription('');
            setTaskPriority('medium');
            setTaskDueDate('');
        } catch (error) {
            setTaskError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    if (user) {
        return (
            <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
                <h1>Client Project Portal</h1>

                <p>
                    Signed in as <strong>{user.name}</strong> ({user.email})
                </p>

                <section
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        maxWidth: '40rem',
                    }}
                >
                    <h2>Dashboard</h2>
                    {organisation && (
                        <p>
                            Current organisation: <strong>{organisation.name}</strong>
                        </p>
                    )}
                    <p>This is a protected area. Auth is working.</p>
                </section>

                <section
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        maxWidth: '40rem',
                        marginTop: '1rem',
                    }}
                >
                    <h2>Clients</h2>

                    <form
                        onSubmit={handleCreateClient}
                        style={{
                            display: 'grid',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                        }}
                    >
                        <label>
                            Client name
                            <input
                                value={clientName}
                                onChange={(event) => setClientName(event.target.value)}
                                style={{ display: 'block', width: '100%' }}
                                required
                            />
                        </label>

                        <label>
                            Contact name
                            <input
                                value={clientContactName}
                                onChange={(event) => setClientContactName(event.target.value)}
                                style={{ display: 'block', width: '100%' }}
                            />
                        </label>

                        <label>
                            Contact email
                            <input
                                type="email"
                                value={clientContactEmail}
                                onChange={(event) => setClientContactEmail(event.target.value)}
                                style={{ display: 'block', width: '100%' }}
                            />
                        </label>

                        {clientError && <p style={{ color: 'red' }}>{clientError}</p>}

                        <button type="submit">
                            Add client
                        </button>
                    </form>

                    {clients.length === 0 ? (
                        <p>No clients yet.</p>
                    ) : (
                        <ul>
                            {clients.map((client) => (
                                <li key={client.id}>
                                    <strong>{client.name}</strong>
                                    {client.contact_email && <> — {client.contact_email}</>}
                                    {' '}
                                    <span>({client.status})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        maxWidth: '40rem',
                        marginTop: '1rem',
                    }}
                >
                    <h2>Projects</h2>

                    {clients.length === 0 ? (
                        <p>Create a client before adding projects.</p>
                    ) : (
                        <form
                            onSubmit={handleCreateProject}
                            style={{
                                display: 'grid',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <label>
                                Client
                                <select
                                    value={projectClientId}
                                    onChange={(event) => setProjectClientId(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                    required
                                >
                                    <option value="">Select a client</option>

                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Project name
                                <input
                                    value={projectName}
                                    onChange={(event) => setProjectName(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                    required
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    value={projectDescription}
                                    onChange={(event) => setProjectDescription(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>

                            <label>
                                Due date
                                <input
                                    type="date"
                                    value={projectDueDate}
                                    onChange={(event) => setProjectDueDate(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>

                            {projectError && <p style={{ color: 'red' }}>{projectError}</p>}

                            <button type="submit">
                                Add project
                            </button>
                        </form>
                    )}

                    {projects.length === 0 ? (
                        <p>No projects yet.</p>
                    ) : (
                        <ul>
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <strong>{project.name}</strong>
                                    {project.client && <> — {project.client.name}</>}
                                    {' '}
                                    <span>({project.status})</span>
                                    {project.due_date && <> — due {project.due_date.slice(0, 10)}</>}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        maxWidth: '40rem',
                        marginTop: '1rem',
                    }}
                >
                    <h2>Tasks</h2>

                    {projects.length === 0 ? (
                        <p>Create a project before adding tasks.</p>
                    ) : (
                        <form
                            onSubmit={handleCreateTask}
                            style={{
                                display: 'grid',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <label>
                                Project
                                <select
                                    value={taskProjectId}
                                    onChange={(event) => setTaskProjectId(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
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
                            </label>

                            <label>
                                Task title
                                <input
                                    value={taskTitle}
                                    onChange={(event) => setTaskTitle(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                    required
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    value={taskDescription}
                                    onChange={(event) => setTaskDescription(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>

                            <label>
                                Priority
                                <select
                                    value={taskPriority}
                                    onChange={(event) =>
                                        setTaskPriority(event.target.value as 'low' | 'medium' | 'high')
                                    }
                                    style={{ display: 'block', width: '100%' }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </label>

                            <label>
                                Due date
                                <input
                                    type="date"
                                    value={taskDueDate}
                                    onChange={(event) => setTaskDueDate(event.target.value)}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>

                            {taskError && <p style={{ color: 'red' }}>{taskError}</p>}

                            <button type="submit">
                                Add task
                            </button>
                        </form>
                    )}

                    {tasks.length === 0 ? (
                        <p>No tasks yet.</p>
                    ) : (
                        <ul>
                            {tasks.map((task) => (
                                <li key={task.id}>
                                    <strong>{task.title}</strong>
                                    {task.project && <> — {task.project.name}</>}
                                    {task.project?.client && <> / {task.project.client.name}</>}
                                    {' '}
                                    <span>({task.status}, {task.priority})</span>
                                    {task.due_date && <> — due {task.due_date.slice(0, 10)}</>}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{ marginTop: '1rem' }}
                >
                    Logout
                </button>
            </main>
        );
    }

    return (
        <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Client Project Portal</h1>

            <div style={{ marginBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setMode('register')}
                    disabled={mode === 'register'}
                >
                    Register
                </button>

                <button
                    type="button"
                    onClick={() => setMode('login')}
                    disabled={mode === 'login'}
                    style={{ marginLeft: '0.5rem' }}
                >
                    Login
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'grid',
                    gap: '0.75rem',
                    maxWidth: '24rem',
                }}
            >
                {mode === 'register' && (
                    <label>
                        Name
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            style={{ display: 'block', width: '100%' }}
                        />
                    </label>
                )}

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        style={{ display: 'block', width: '100%' }}
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        style={{ display: 'block', width: '100%' }}
                    />
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Please wait...'
                        : mode === 'register'
                            ? 'Create account'
                            : 'Login'}
                </button>
            </form>
        </main>
    );
}

export default App;