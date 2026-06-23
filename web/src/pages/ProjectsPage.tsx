import type { FormEvent } from 'react';

import type { Client } from '../features/clients/types';
import type { Project } from '../features/projects/types';

type ProjectsPageProps = {
    projects: Project[];
    clients: Client[];

    projectClientId: string;
    projectName: string;
    projectDescription: string;
    projectDueDate: string;
    projectError: string | null;

    onProjectClientIdChange: (value: string) => void;
    onProjectNameChange: (value: string) => void;
    onProjectDescriptionChange: (value: string) => void;
    onProjectDueDateChange: (value: string) => void;
    onCreateProject: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProjectsPage({
                                 projects,
                                 clients,
                                 projectClientId,
                                 projectName,
                                 projectDescription,
                                 projectDueDate,
                                 projectError,
                                 onProjectClientIdChange,
                                 onProjectNameChange,
                                 onProjectDescriptionChange,
                                 onProjectDueDateChange,
                                 onCreateProject,
}: ProjectsPageProps) {
    return (
        <section className="content-card" id="projects">
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
                <form onSubmit={onCreateProject} className="form-grid">
                    <div className="form-row">
                        <label htmlFor="project-client">Client</label>
                        <select
                            id="project-client"
                            className="select"
                            value={projectClientId}
                            onChange={(event) => onProjectClientIdChange(event.target.value)}
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
                            onChange={(event) => onProjectNameChange(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="project-description">Description</label>
                        <textarea
                            id="project-description"
                            className="textarea"
                            value={projectDescription}
                            onChange={(event) => onProjectDescriptionChange(event.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="project-due-date">Due date</label>
                        <input
                            id="project-due-date"
                            className="input"
                            type="date"
                            value={projectDueDate}
                            onChange={(event) => onProjectDueDateChange(event.target.value)}
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
    )
}