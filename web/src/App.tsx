import { FormEvent, useEffect, useState } from 'react';
import {
    getMe,
    login,
    logout,
    register,
} from './features/auth/authApi';
import type { User } from './features/auth/types';

const TOKEN_STORAGE_KEY = 'cpp_auth_token';

function App() {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem(TOKEN_STORAGE_KEY),
    );

    const [user, setUser] = useState<User | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [name, setName] = useState('Tom Denver');
    const [email, setEmail] = useState('tom@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function saveToken(nextToken: string) {
        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        setToken(nextToken);
    }

    function clearAuth() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
    }

    useEffect(() => {
        if (!token) {
            return;
        }

        getMe(token)
            .then((response) => {
                setUser(response.user);
            })
            .catch(() => {
                clearAuth();
            });
    }, [token]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const response =
                mode === 'register'
                    ? await register({
                        name,
                        email,
                        password,
                        password_confirmation: password,
                    })
                    : await login({
                        email,
                        password,
                    });

            saveToken(response.token);
            setUser(response.user);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        if (!token) {
            clearAuth();
            return;
        }

        try {
            await logout(token);
        } finally {
            clearAuth();
        }
    }

    if (user) {
        return (
            <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
                <h1>Client Project Portal</h1>

                <p>
                    Signed in as <strong>{user.name}</strong> ({user.email})
                </p>

                <section
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        maxWidth: '40rem',
                    }}
                >
                    <h2>Dashboard</h2>
                    <p>This is a protected area. Auth is working.</p>
                </section>

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{ marginTop: '1rem' }}
                >
                    Logout
                </button>
            </main>
        );
    }

    return (
        <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Client Project Portal</h1>

            <div style={{ marginBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setMode('register')}
                    disabled={mode === 'register'}
                >
                    Register
                </button>

                <button
                    type="button"
                    onClick={() => setMode('login')}
                    disabled={mode === 'login'}
                    style={{ marginLeft: '0.5rem' }}
                >
                    Login
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'grid',
                    gap: '0.75rem',
                    maxWidth: '24rem',
                }}
            >
                {mode === 'register' && (
                    <label>
                        Name
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            style={{ display: 'block', width: '100%' }}
                        />
                    </label>
                )}

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        style={{ display: 'block', width: '100%' }}
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        style={{ display: 'block', width: '100%' }}
                    />
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Please wait...'
                        : mode === 'register'
                            ? 'Create account'
                            : 'Login'}
                </button>
            </form>
        </main>
    );
}

export default App;