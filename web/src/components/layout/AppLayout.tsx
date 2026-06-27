import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type AppLayoutProps = {
    children: ReactNode;
    canManageTeam: boolean;
    userName?: string;
    organisationName?: string;
    role?: string | null;
    onLogout: () => void;
};

export function AppLayout({
                              children,
                              canManageTeam,
                              userName,
                              organisationName,
                              role,
                              onLogout,
                          }: AppLayoutProps) {
    return (
        <div className="app-shell">
            <Sidebar canManageTeam={canManageTeam} />

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