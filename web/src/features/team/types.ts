export type TeamRole = 'owner' | 'admin' | 'member';

export type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: TeamRole;
    joined_at?: string;
};

export type TeamResponse = {
    members: TeamMember[];
};

export type TeamMemberResponse = {
    member: TeamMember;
};