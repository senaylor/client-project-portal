export type Client = {
    id: number;
    organisation_id: number;
    name: string;
    contact_name: string | null;
    contact_email: string | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
};

export type ClientsResponse = {
    clients: Client[];
};

export type ClientResponse = {
    client: Client;
};