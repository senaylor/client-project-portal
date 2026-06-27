import type {FormEvent} from 'react';

import type {User} from '../features/auth/types';
import type {TeamMember, TeamRole} from '../features/team/types';

type EditableTeamRole = Exclude<TeamRole, 'owner'>;

type TeamPageProps = {
    teamMembers: TeamMember[];
    currentUser: User;
    teamEmail: string;
    teamRole: EditableTeamRole;
    teamError: string | null;
    canChangeRoles: boolean;

    onTeamEmailChange: (value: string) => void;
    onTeamRoleChange: (value: EditableTeamRole) => void;
    onAddTeamMember: (event: FormEvent<HTMLFormElement>) => void;
    onChangeTeamRole: (member: TeamMember, role: EditableTeamRole) => void;
    onRemoveTeamMember: (member: TeamMember) => void;
};


export function TeamPage({
                             teamMembers,
                             currentUser,
                             teamEmail,
                             teamRole,
                             teamError,
                             canChangeRoles,
                             onTeamEmailChange,
                             onTeamRoleChange,
                             onAddTeamMember,
                             onChangeTeamRole,
                             onRemoveTeamMember,
                         }: TeamPageProps) {
    return (
        <section className="content-card">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Team</p>
                    <h2>Manage team members</h2>
                </div>
            </div>

            <form onSubmit={onAddTeamMember} className="form-grid">
                <div className="form-row">
                    <label htmlFor="team-email">User email</label>
                    <input
                        id="team-email"
                        className="input"
                        type="email"
                        value={teamEmail}
                        onChange={(event) => onTeamEmailChange(event.target.value)}
                        placeholder="existing-user@example.com"
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
                            onTeamRoleChange(
                                event.target.value as Exclude<TeamRole, 'owner'>,
                            )
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

            <div className="section-heading">
                <div>
                    <p className="eyebrow">Members</p>
                    <h2>Current team</h2>
                </div>
            </div>

            {teamMembers.length > 0 ? (
                <ul className="list-stack">
                    {teamMembers.map((member) => {
                        const normalizedRole = member.role
                            .trim()
                            .toLowerCase() as TeamRole;

                        const isOwner = normalizedRole === 'owner';
                        const isCurrentUser = member.id === currentUser.id;

                        const canEditRole =
                            canChangeRoles && !isOwner && !isCurrentUser;

                        const canRemoveMember = !isOwner && !isCurrentUser;

                        return (
                            <li key={member.id} className="list-item">
                                <div>
                                    <div className="list-item-title">
                                        {member.name}
                                    </div>

                                    <div className="list-item-meta">
                                        {member.email}
                                    </div>
                                </div>

                                <div>
                                <span className="badge">
                                    {normalizedRole}
                                </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {canEditRole && (
                                        <select
                                            className="select"
                                            value={
                                                normalizedRole === 'admin'
                                                    ? 'admin'
                                                    : 'member'
                                            }
                                            onChange={(event) =>
                                                onChangeTeamRole(
                                                    member,
                                                    event.target
                                                        .value as Exclude<
                                                        TeamRole,
                                                        'owner'
                                                    >,
                                                )
                                            }
                                        >
                                            <option value="member">
                                                Member
                                            </option>
                                            <option value="admin">
                                                Admin
                                            </option>
                                        </select>
                                    )}

                                    {canRemoveMember && (
                                        <button
                                            type="button"
                                            className="button ghost"
                                            onClick={() =>
                                                onRemoveTeamMember(member)
                                            }
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="empty-state">No team members yet.</p>
            )}
        </section>
    )
}