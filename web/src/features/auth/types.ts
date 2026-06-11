export type User = {
    id: number;
    name: string;
    email: string;
};

export type Organisation = {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
};

export type AuthResponse = {
    user: User;
    organisation?: Organisation;
    token: string;
};

export type MeResponse = {
    user: User;
};

export type CurrentOrganisationResponse = {
    organisation: Organisation | null;
};