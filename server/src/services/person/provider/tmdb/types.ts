import {
  PersonCombinedCreditsResponse,
  PersonDetailsResponse,
} from '@/infrastructure/generated/tmdb-api-client';

export type PersonDetailsProviderResponse = PersonDetailsResponse & {
  combined_credits?: Omit<PersonCombinedCreditsResponse, 'id'>;
};
