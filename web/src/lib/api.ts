const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
};

export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {},
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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