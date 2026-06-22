import "../App.css";

import { useEffect, useState } from 'react'; //runtime value
import type { FormEvent } from 'react'; //TypeScript-only type
import { getCurrentOrganisation } from '../features/organisations/organisationApi';
import { createClient, getClients } from '../features/clients/clientApi';
import { createProject, getProjects } from '../features/projects/projectApi';
import { createTask, getTasks } from '../features/tasks/taskApi';
import { getDashboard } from "../features/dashboard/dashboardApi";
import {
    getMe,
    login,
    logout,
    register,
} from '../features/auth/authApi';
import {
    addTeamMember,
    getTeam,
    removeTeamMember,
    updateTeamMemberRole,
} from "../features/team/teamApi.ts";

import type { User, Organisation } from '../features/auth/types';
import type { Client } from '../features/clients/types';
import type { Project } from '../features/projects/types';
import type { Task } from '../features/tasks/types'
import type { DashboardSummary } from "../features/dashboard/types";
import type { TeamMember, TeamRole } from "../features/team/types";

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

    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamEmail, setTeamEmail] = useState('');
    const [teamRole, setTeamRole] = useState<Exclude<TeamRole, 'owner'>>('member');
    const [teamError, setTeamError] = useState<string | null>(null);

    const currentMember = user
        ? teamMembers.find((member) => member.id === user.id)
        : null;

    const currentRole = currentMember?.role?.trim().toLowerCase();

    const canManageTeam = ['owner', 'admin'].includes(currentRole ?? '');
    const canChangeRoles = currentRole === 'owner';

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
        setDashboardSummary(null);
        setTeamMembers([]);
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
            getDashboard(token),
            getTeam(token),
        ])
            .then(([meResponse,
                       organisationResponse,
                       clientsResponse,
                       projectsResponse,
                       tasksResponse,
                       dashboardSummary,
                       teamResponse,
                   ]) => {
                setUser(meResponse.user);
                setOrganisation(organisationResponse.organisation);
                setClients(clientsResponse.clients);
                setProjects(projectsResponse.projects);
                setTasks(tasksResponse.tasks);
                setDashboardSummary(dashboardSummary.summary);
                setTeamMembers(teamResponse.members);
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
            await refreshDashboardSummary(token);
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
            await refreshDashboardSummary(token);
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
            await refreshDashboardSummary(token);

            setTaskTitle('');
            setTaskDescription('');
            setTaskPriority('medium');
            setTaskDueDate('');
        } catch (error) {
            setTaskError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    async function refreshDashboardSummary(currentToken: string) {
        const response = await getDashboard(currentToken);
        setDashboardSummary(response.summary);
    }

    async function handleAddTeamMember(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            return;
        }

        setTeamError(null);

        try {
            const response = await addTeamMember(token, {
                email: teamEmail,
                role: teamRole,
            });

            setTeamMembers((currentMembers) => [
                ...currentMembers,
                response.member,
            ]);

            setTeamEmail('');
            setTeamRole('member');
        } catch (error) {
            setTeamError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    async function handleChangeTeamRole(member: TeamMember, role: Exclude<TeamRole, 'owner'>) {
        if (!token) {
            return;
        }

        setTeamError(null);

        try {
            const response = await updateTeamMemberRole(token, member.id, {
                role,
            });

            setTeamMembers((currentMembers) =>
                currentMembers.map((currentMember) =>
                    currentMember.id === member.id ? response.member : currentMember,
                ),
            );
        } catch (error) {
            setTeamError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    async function handleRemoveTeamMember(member: TeamMember) {
        if (!token) {
            return;
        }

        setTeamError(null);

        try {
            await removeTeamMember(token, member.id);

            setTeamMembers((currentMembers) =>
                currentMembers.filter((currentMember) => currentMember.id !== member.id),
            );
        } catch (error) {
            setTeamError(error instanceof Error ? error.message : 'Something went wrong');
        }
    }

    if (user) {
        return (
            <div className="app-shell">
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-title">Client Project Portal</div>
                        <div className="sidebar-brand-subtitle">
                            {organisation?.name ?? 'SaaS Workspace'}
                        </div>
                    </div>

                    <nav className="sidebar-nav" aria-label="Main navigation">
                        <a className="sidebar-nav-item active" href="#dashboard">
                            Dashboard
                        </a>
                        <a className="sidebar-nav-item" href="#clients">
                            Clients
                        </a>
                        <a className="sidebar-nav-item" href="#projects">
                            Projects
                        </a>
                        <a className="sidebar-nav-item" href="#tasks">
                            Tasks
                        </a>
                        <a className="sidebar-nav-item" href="#team">
                            Team
                        </a>
                    </nav>

                    <div className="sidebar-footer">
                        MVP build · Laravel + React
                    </div>
                </aside>

                <div className="main-area">
                    <header className="topbar">
                        <div>
                            <h1 className="topbar-title">Dashboard</h1>
                            <p className="page-subtitle">
                                Manage your client work from one workspace.
                            </p>
                        </div>

                        <div className="topbar-user">
            <span>
              Signed in as <strong>{user.name}</strong>
            </span>

                            <button type="button" className="button ghost" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="page" id="dashboard">
                        <section className="page-header">
                            <h2 className="page-title">Workspace overview</h2>
                            <p className="page-subtitle">
                                {organisation
                                    ? `Current organisation: ${organisation.name}`
                                    : 'No organisation loaded'}
                            </p>
                        </section>

                        {dashboardSummary && (
                            <section className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-label">Total clients</div>
                                    <p className="metric-value">{dashboardSummary.total_clients}</p>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-label">Active projects</div>
                                    <p className="metric-value">{dashboardSummary.active_projects}</p>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-label">Open tasks</div>
                                    <p className="metric-value">{dashboardSummary.open_tasks}</p>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-label">Overdue tasks</div>
                                    <p className="metric-value">{dashboardSummary.overdue_tasks}</p>
                                </div>
                            </section>
                        )}

                        {dashboardSummary?.overdue_tasks ? (
                            <p className="error-message">
                                You have {dashboardSummary.overdue_tasks} overdue task
                                {dashboardSummary.overdue_tasks === 1 ? '' : 's'}.
                            </p>
                        ) : null}

                        <section className="content-grid">
                            <section className="card" id="clients">
                                <div className="card-header">
                                    <div>
                                        <h3 className="card-title">Clients</h3>
                                        <p className="card-description">
                                            Add the companies or people you manage work for.
                                        </p>
                                    </div>

                                    <span className="badge">{clients.length}</span>
                                </div>

                                <form onSubmit={handleCreateClient} className="form-grid">
                                    <div className="form-row">
                                        <label htmlFor="client-name">Client name</label>
                                        <input
                                            id="client-name"
                                            className="input"
                                            value={clientName}
                                            onChange={(event) => setClientName(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="client-contact-name">Contact name</label>
                                        <input
                                            id="client-contact-name"
                                            className="input"
                                            value={clientContactName}
                                            onChange={(event) => setClientContactName(event.target.value)}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="client-contact-email">Contact email</label>
                                        <input
                                            id="client-contact-email"
                                            className="input"
                                            type="email"
                                            value={clientContactEmail}
                                            onChange={(event) => setClientContactEmail(event.target.value)}
                                        />
                                    </div>

                                    {clientError && <p className="error-message">{clientError}</p>}

                                    <button type="submit" className="button">
                                        Add client
                                    </button>
                                </form>

                                <hr />

                                {clients.length === 0 ? (
                                    <p className="empty-state">No clients yet.</p>
                                ) : (
                                    <ul className="list">
                                        {clients.map((client) => (
                                            <li key={client.id} className="list-item">
                                                <div className="list-item-title">{client.name}</div>
                                                <div className="list-item-meta">
                                                    {client.contact_email || 'No contact email'} · {client.status}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                            <section className="card" id="projects">
                                <div className="card-header">
                                    <div>
                                        <h3 className="card-title">Projects</h3>
                                        <p className="card-description">
                                            Track active client work and due dates.
                                        </p>
                                    </div>

                                    <span className="badge">{projects.length}</span>
                                </div>

                                {clients.length === 0 ? (
                                    <p className="empty-state">Create a client before adding projects.</p>
                                ) : (
                                    <form onSubmit={handleCreateProject} className="form-grid">
                                        <div className="form-row">
                                            <label htmlFor="project-client">Client</label>
                                            <select
                                                id="project-client"
                                                className="select"
                                                value={projectClientId}
                                                onChange={(event) => setProjectClientId(event.target.value)}
                                                required
                                            >
                                                <option value="">Select a client</option>

                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="project-name">Project name</label>
                                            <input
                                                id="project-name"
                                                className="input"
                                                value={projectName}
                                                onChange={(event) => setProjectName(event.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="project-description">Description</label>
                                            <textarea
                                                id="project-description"
                                                className="textarea"
                                                value={projectDescription}
                                                onChange={(event) => setProjectDescription(event.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="project-due-date">Due date</label>
                                            <input
                                                id="project-due-date"
                                                className="input"
                                                type="date"
                                                value={projectDueDate}
                                                onChange={(event) => setProjectDueDate(event.target.value)}
                                            />
                                        </div>

                                        {projectError && <p className="error-message">{projectError}</p>}

                                        <button type="submit" className="button">
                                            Add project
                                        </button>
                                    </form>
                                )}

                                <hr />

                                {projects.length === 0 ? (
                                    <p className="empty-state">No projects yet.</p>
                                ) : (
                                    <ul className="list">
                                        {projects.map((project) => (
                                            <li key={project.id} className="list-item">
                                                <div className="list-item-title">{project.name}</div>
                                                <div className="list-item-meta">
                                                    {project.client?.name ?? 'No client'} · {project.status}
                                                    {project.due_date ? ` · due ${project.due_date.slice(0, 10)}` : ''}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                            <section className="card" id="tasks">
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
                                    <form onSubmit={handleCreateTask} className="form-grid">
                                        <div className="form-row">
                                            <label htmlFor="task-project">Project</label>
                                            <select
                                                id="task-project"
                                                className="select"
                                                value={taskProjectId}
                                                onChange={(event) => setTaskProjectId(event.target.value)}
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
                                                onChange={(event) => setTaskTitle(event.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="task-description">Description</label>
                                            <textarea
                                                id="task-description"
                                                className="textarea"
                                                value={taskDescription}
                                                onChange={(event) => setTaskDescription(event.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="task-priority">Priority</label>
                                            <select
                                                id="task-priority"
                                                className="select"
                                                value={taskPriority}
                                                onChange={(event) =>
                                                    setTaskPriority(event.target.value as 'low' | 'medium' | 'high')
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
                                                onChange={(event) => setTaskDueDate(event.target.value)}
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
                                                    {task.project?.name ?? 'No project'}
                                                    {task.project?.client ? ` / ${task.project.client.name}` : ''}
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
                            <section className="card" id="team">
                                <div className="card-header">
                                    <div>
                                        <h3 className="card-title">Team</h3>
                                        <p className="card-description">
                                            Manage organisation members and access levels.
                                        </p>
                                    </div>

                                    <span className="badge">{teamMembers.length}</span>
                                </div>

                                <p className="list-item-meta">
                                    Your role: <strong>{currentRole ?? 'unknown'}</strong>
                                </p>

                                {canManageTeam ? (
                                    <form onSubmit={handleAddTeamMember} className="form-grid">
                                        <div className="form-row">
                                            <label htmlFor="team-email">User email</label>
                                            <input
                                                id="team-email"
                                                className="input"
                                                type="email"
                                                value={teamEmail}
                                                onChange={(event) => setTeamEmail(event.target.value)}
                                                placeholder="existing.user@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <label htmlFor="team-role">Role</label>
                                            <select
                                                id="team-role"
                                                className="select"
                                                value={teamRole}
                                                onChange={(event) =>
                                                    setTeamRole(event.target.value as Exclude<TeamRole, 'owner'>)
                                                }
                                            >
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        {teamError && <p className="error-message">{teamError}</p>}

                                        <button type="submit" className="button">
                                            Add team member
                                        </button>
                                    </form>
                                ) : (
                                    <p className="empty-state">
                                        You do not have permission to manage team members.
                                    </p>
                                )}

                                <hr />

                                {teamMembers.length === 0 ? (
                                    <p className="empty-state">No team members yet.</p>
                                ) : (
                                    <ul className="list">
                                        {teamMembers.map((member) => (
                                            <li key={member.id} className="list-item">
                                                <div className="list-item-title">{member.name}</div>
                                                <div className="list-item-meta">{member.email}</div>

                                                <div>
                                                    <span className="badge">{member.role}</span>
                                                </div>

                                                {canManageTeam && member.role !== 'owner' && member.id !== user.id && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {canChangeRoles && (
                                                            <select
                                                                className="select"
                                                                value={member.role}
                                                                onChange={(event) =>
                                                                    handleChangeTeamRole(
                                                                        member,
                                                                        event.target.value as Exclude<TeamRole, 'owner'>,
                                                                    )
                                                                }
                                                            >
                                                                <option value="member">Member</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="button ghost"
                                                            onClick={() => handleRemoveTeamMember(member)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1 className="auth-title">Client Project Portal</h1>
                <p className="auth-subtitle">
                    Sign in to manage clients, projects, and tasks.
                </p>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={mode === 'register' ? 'button' : 'button secondary'}
                        onClick={() => setMode('register')}
                        disabled={mode === 'register'}
                    >
                        Register
                    </button>

                    <button
                        type="button"
                        className={mode === 'login' ? 'button' : 'button secondary'}
                        onClick={() => setMode('login')}
                        disabled={mode === 'login'}
                    >
                        Login
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-grid">
                    {mode === 'register' && (
                        <div className="form-row">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                className="input"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-row">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="button" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : mode === 'register'
                                ? 'Create account'
                                : 'Login'}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default App;