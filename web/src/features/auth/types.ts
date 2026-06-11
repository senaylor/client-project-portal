export type User = {
    id: number;
    name: string;
    email: string;
};

export type AuthResponse = {
    user: User;
    token: string;
};

export type MeResponse = {
    user: User;
};