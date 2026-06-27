import "../App.css";

import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from "../pages/DashboardPage";
import { ClientsPage } from "../pages/ClientsPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { TasksPage } from "../pages/TasksPage";
import { TeamPage } from "../pages/TeamPage";

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

import { Navigate, Route, Routes } from 'react-router-dom';

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
    const [clientError, setClientError] = useState<string | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectClientId, setProjectClientId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectDueDate, setProjectDueDate] = useState('');
    const [projectError, setProjectError] = useState<string | null>(null);

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
            <AppLayout
                canManageTeam={canManageTeam}
                userName={user.name}
                organisationName={organisation?.name}
                role={currentRole}
                onLogout={handleLogout}
            >
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <DashboardPage
                                dashboard={dashboardSummary}
                                organisation={organisation}
                            />
                        }
                    />

                    <Route
                        path="/clients"
                        element={
                            <ClientsPage
                                clients={clients}
                                clientName={clientName}
                                clientContactName={clientContactName}
                                clientContactEmail={clientContactEmail}
                                clientError={clientError}
                                onClientNameChange={setClientName}
                                onClientContactNameChange={setClientContactName}
                                onClientContactEmailChange={setClientContactEmail}
                                onCreateClient={handleCreateClient}
                            />
                        }
                    />

                    <Route
                        path="/projects"
                        element={
                            <ProjectsPage
                                projects={projects}
                                clients={clients}
                                projectClientId={projectClientId}
                                projectName={projectName}
                                projectDescription={projectDescription}
                                projectDueDate={projectDueDate}
                                projectError={projectError}
                                onProjectClientIdChange={setProjectClientId}
                                onProjectNameChange={setProjectName}
                                onProjectDescriptionChange={setProjectDescription}
                                onProjectDueDateChange={setProjectDueDate}
                                onCreateProject={handleCreateProject}
                            />
                        }
                    />

                    <Route
                        path="/tasks"
                        element={
                            <TasksPage
                                tasks={tasks}
                                projects={projects}
                                taskProjectId={taskProjectId}
                                taskTitle={taskTitle}
                                taskDescription={taskDescription}
                                taskPriority={taskPriority}
                                taskDueDate={taskDueDate}
                                taskError={taskError}
                                onTaskProjectIdChange={setTaskProjectId}
                                onTaskTitleChange={setTaskTitle}
                                onTaskDescriptionChange={setTaskDescription}
                                onTaskPriorityChange={setTaskPriority}
                                onTaskDueDateChange={setTaskDueDate}
                                onCreateTask={handleCreateTask}
                            />
                        }
                    />

                    <Route
                        path="/team"
                        element={
                            canManageTeam ? (
                                <TeamPage
                                    teamMembers={teamMembers}
                                    currentUser={user}
                                    teamEmail={teamEmail}
                                    teamRole={teamRole}
                                    teamError={teamError}
                                    canChangeRoles={canChangeRoles}
                                    onTeamEmailChange={setTeamEmail}
                                    onTeamRoleChange={setTeamRole}
                                    onAddTeamMember={handleAddTeamMember}
                                    onChangeTeamRole={handleChangeTeamRole}
                                    onRemoveTeamMember={handleRemoveTeamMember}
                                />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </AppLayout>
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