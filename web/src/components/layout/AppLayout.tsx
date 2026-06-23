import type { View } from '../../app/types';

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppLayoutProps = {
    children: React.ReactNode;
    currentView: string;
    onNavigate: (view: View) => void;
    canManageTeam: boolean;
    userName?: string;
    organisationName?: string;
    role?: string | null;
    onLogout: () => void;
};

export function AppLayout({
                              children,
                              currentView,
                              onNavigate,
                              canManageTeam,
                              userName,
                              organisationName,
                              role,
                              onLogout,
                          }: AppLayoutProps) {
    return (
        <div className="app-shell">
            <Sidebar
                currentView={currentView}
                onNavigate={onNavigate}
                canManageTeam={canManageTeam}
            />

            <main className="main-content">
                <Topbar
                    userName={userName}
                    organisationName={organisationName}
                    role={role}
                    onLogout={onLogout}
                />

                {children}
            </main>
        </div>
    );
}