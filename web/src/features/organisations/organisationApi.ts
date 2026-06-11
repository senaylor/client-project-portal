import { apiRequest } from '../../lib/api';
import type { CurrentOrganisationResponse } from '../auth/types';

export function getCurrentOrganisation(token: string) {
    return apiRequest<CurrentOrganisationResponse>('/organisation/current', {
        token,
    });
}