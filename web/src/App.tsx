import { useEffect, useState } from 'react';
import { apiGet } from './lib/api';

type HealthResponse = {
  status: string;
  app: string;
  environment: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<HealthResponse>('/health')
        .then(setHealth)
        .catch((error: unknown) => {
          setError(error instanceof Error ? error.message : 'Unknown error');
        });
  }, []);

  return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Client Project Portal</h1>

        <p>Laravel API connection test:</p>

        {health && <pre>{JSON.stringify(health, null, 2)}</pre>}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </main>
  );
}

export default App;