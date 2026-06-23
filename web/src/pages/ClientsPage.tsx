import type { FormEvent } from 'react';
import type { Client } from '../features/clients/types';

type ClientsPageProps = {
    clients: Client[];
    clientName: string;
    clientContactName: string;
    clientContactEmail: string;
    clientError: string | null;
    onClientNameChange: (value: string) => void;
    onClientContactNameChange: (value: string) => void;
    onClientContactEmailChange: (value: string) => void;
    onCreateClient: (event: FormEvent<HTMLFormElement>) => void;
};

export function ClientsPage ({
    clients,
    clientName,
    clientContactName,
    clientContactEmail,
    clientError,
    onClientNameChange,
    onClientContactNameChange,
    onClientContactEmailChange,
    onCreateClient,
} : ClientsPageProps) {
    return (
        <section className="card" id="clients">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Clients</h3>
                    <p className="card-description">
                        Add the companies or people you manage work for.
                    </p>
                </div>

                <span className="badge">{clients.length}</span>
            </div>

            <form onSubmit={onCreateClient} className="form-grid">
                <div className="form-row">
                    <label htmlFor="client-name">Client name</label>
                    <input
                        id="client-name"
                        className="input"
                        value={clientName}
                        onChange={(event) => onClientNameChange(event.target.value)}
                        required
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="client-contact-name">Contact name</label>
                    <input
                        id="client-contact-name"
                        className="input"
                        value={clientContactName}
                        onChange={(event) => onClientContactNameChange(event.target.value)}
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="client-contact-email">Contact email</label>
                    <input
                        id="client-contact-email"
                        className="input"
                        type="email"
                        value={clientContactEmail}
                        onChange={(event) => onClientContactEmailChange(event.target.value)}
                    />
                </div>

                {clientError && <p className="error-message">{clientError}</p>}

                <button type="submit" className="button">
                    Add client
                </button>
            </form>

            <hr />

            {clients.length === 0 ? (
                <p className="empty-state">No clients yet.</p>
            ) : (
                <ul className="list">
                    {clients.map((client) => (
                        <li key={client.id} className="list-item">
                            <div className="list-item-title">{client.name}</div>
                            <div className="list-item-meta">
                                {client.contact_email || 'No contact email'} · {client.status}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}