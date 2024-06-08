import {
  PersonCombinedCreditsResponse,
  PersonDetailsResponse,
} from '@/infrastructure/tmdb/client';

export type PersonDetailsProviderResponse = PersonDetailsResponse & {
  combined_credits?: Omit<PersonCombinedCreditsResponse, 'id'>;
};
