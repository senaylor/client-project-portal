type TopbarProps = {
    userName?: string;
    organisationName?: string;
    role?: string | null;
    onLogout: () => void;
};

export function Topbar({
                           userName,
                           organisationName,
                           role,
                           onLogout,
                       }: TopbarProps) {
    return (
        <header className="topbar">
            <div>
                <p className="eyebrow">Current organisation</p>
                <h2>{organisationName ?? 'Organisation'}</h2>
            </div>

            <div className="topbar-user">
                <div>
                    <strong>{userName ?? 'User'}</strong>

                    {role && (
                        <span className="role-badge">
              {role}
            </span>
                    )}
                </div>

                <button type="button" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}