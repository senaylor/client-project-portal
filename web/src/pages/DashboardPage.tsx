import type { DashboardSummary } from '../features/dashboard/types';
import type { Organisation } from "../features/auth/types.ts";

type DashboardPageProps = {
    dashboard: DashboardSummary | null;
    organisation: Organisation | null;
};

export function DashboardPage ({ dashboard, organisation } : DashboardPageProps) {
    return (
        <main className="page" id="dashboard">
            <section className="page-header">
                <h2 className="page-title">Workspace overview</h2>
                <p className="page-subtitle">
                    {organisation
                        ? `Current organisation: ${organisation.name}`
                        : 'No organisation loaded'}
                </p>
            </section>

            {dashboard && (
                <section className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-label">Total clients</div>
                        <p className="metric-value">{dashboard.total_clients}</p>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Active projects</div>
                        <p className="metric-value">{dashboard.active_projects}</p>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Open tasks</div>
                        <p className="metric-value">{dashboard.open_tasks}</p>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Overdue tasks</div>
                        <p className="metric-value">{dashboard.overdue_tasks}</p>
                    </div>
                </section>
            )}

            {dashboard?.overdue_tasks ? (
                <p className="error-message">
                    You have {dashboard.overdue_tasks} overdue task
                    {dashboard.overdue_tasks === 1 ? '' : 's'}.
                </p>
            ) : null}

            <section className="content-grid">

            </section>

        </main>
    )
}