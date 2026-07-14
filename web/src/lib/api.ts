const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const API_BASE_URL =
    rawApiBaseUrl && rawApiBaseUrl.trim().length > 0
        ? rawApiBaseUrl.replace(/\/$/, '')
        : 'http://localhost:8002/api';

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
};

export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {},
): Promise<T> {
    const normalisedPath = path.startsWith('/') ? path : `/${path}`;

    const response = await fetch(`${API_BASE_URL}${normalisedPath}`, {
        method: options.method ?? 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.token
                ? {
                    Authorization: `Bearer ${options.token}`,
                }
                : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        const message =
            errorBody?.message ??
            `API request failed with status ${response.status}`;

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}