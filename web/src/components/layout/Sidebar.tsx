import { NavLink } from 'react-router-dom';

import { viewRoutes } from '../../app/types';

type SidebarProps = {
    canManageTeam: boolean;
};

export function Sidebar({ canManageTeam }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">CP</div>
                <div>
                    <h1>Client Project Portal</h1>
                    <p>Portfolio SaaS</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to={viewRoutes.dashboard}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to={viewRoutes.clients}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Clients
                </NavLink>

                <NavLink
                    to={viewRoutes.projects}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Projects
                </NavLink>

                <NavLink
                    to={viewRoutes.tasks}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Tasks
                </NavLink>

                {canManageTeam && (
                    <NavLink
                        to={viewRoutes.team}
                        className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                        Team
                    </NavLink>
                )}
            </nav>
        </aside>
    );
}