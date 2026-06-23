import type { View } from '../../app/types';

type SidebarProps = {
    currentView: string;
    onNavigate: (view: View) => void;
    canManageTeam: boolean;
};

export function Sidebar({
                            currentView,
                            onNavigate,
                            canManageTeam,
                        }: SidebarProps) {
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
                <button
                    type="button"
                    className={currentView === 'dashboard' ? 'active' : ''}
                    onClick={() => onNavigate('dashboard')}
                >
                    Dashboard
                </button>

                <button
                    type="button"
                    className={currentView === 'clients' ? 'active' : ''}
                    onClick={() => onNavigate('clients')}
                >
                    Clients
                </button>

                <button
                    type="button"
                    className={currentView === 'projects' ? 'active' : ''}
                    onClick={() => onNavigate('projects')}
                >
                    Projects
                </button>

                <button
                    type="button"
                    className={currentView === 'tasks' ? 'active' : ''}
                    onClick={() => onNavigate('tasks')}
                >
                    Tasks
                </button>

                {canManageTeam && (
                    <button
                        type="button"
                        className={currentView === 'team' ? 'active' : ''}
                        onClick={() => onNavigate('team')}
                    >
                        Team
                    </button>
                )}
            </nav>
        </aside>
    );
}