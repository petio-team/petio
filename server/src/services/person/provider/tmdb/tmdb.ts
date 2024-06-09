import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { TheMovieDatabaseApiClient } from '@/infrastructure/generated/clients';
import { ApiError } from '@/infrastructure/generated/tmdb-api-client';
import is from '@/infrastructure/utils/is';
import { PersonEntity } from '@/resources/person/entity';
import { PersonGender, PersonProps } from '@/resources/person/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  PersonDetailsProvider,
  PersonProviderDetailsResponse,
  PersonProviderTrendingResponse,
} from '@/services/person/provider/provider';
import { PersonDetailsProviderResponse } from '@/services/person/provider/tmdb/types';

@Service()
export class TmdbPersonProvider implements PersonDetailsProvider {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  constructor(
    private cacheProvider: CacheProvider,
    private client: TheMovieDatabaseApiClient,
  ) {}

  /**
   * Maps a gender value to the corresponding PersonGender enum value.
   * @param gender - The gender value to be mapped.
   * @returns The corresponding PersonGender enum value.
   */
  private mapToGenderProp(gender?: number): PersonGender {
    switch (gender) {
      case 1:
        return PersonGender.Female;
      case 2:
        return PersonGender.Male;
      case 3:
        return PersonGender.Other;
      default:
        return PersonGender.Unknown;
    }
  }

  /**
   * Retrieves the details of a person from the TMDB provider.
   * @param id - The ID of the person.
   * @returns A promise that resolves to the details of the person.
   * @throws {NotFoundException} If the person is not found.
   * @throws {InternalServerErrorException} If there is an error fetching the person details.
   */
  async getDetails(id: number): Promise<PersonProviderDetailsResponse> {
    try {
      const details = await this.cacheProvider.wrap<PersonProps>(
        `tmdb.person.${id}`,
        async () => {
          const person = (await this.client.default.personDetails({
            personId: id,
            appendToResponse: ['combined_credits'].join(','),
          })) as PersonDetailsProviderResponse;
          return {
            name: person.name || '',
            gender: this.mapToGenderProp(person.gender),
            role: person.known_for_department || '',
            bio: person.biography || '',
            birthDate: person.birthday || '',
            popularity: {
              tmdb: person.popularity || 0,
            },
            artwork: {
              poster: person.profile_path
                ? {
                    url: person.profile_path,
                    source: 'tmdb',
                  }
                : undefined,
            },
            media: {
              movies:
                person.combined_credits?.cast
                  ?.filter((media) => media.media_type === 'movie')
                  .map((media) => ({
                    name: media.title!,
                    provider: {
                      tmdbId: media.id!,
                    },
                  })) || [],
              shows:
                person.combined_credits?.cast
                  ?.filter((media) => media.media_type === 'tv')
                  .map((media) => ({
                    name: media.title!,
                    provider: {
                      tmdbId: media.id!,
                    },
                  })) || [],
            },
            provider: {
              tmdbId: person.id!,
            },
            source: 'tmdb',
          };
        },
        this.defaultCacheTTL,
      );
      return Ok(PersonEntity.create(details));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Person not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch person details'),
      );
    }
  }

  /**
   * Retrieves the trending people from the TMDB API.
   * @returns A Promise that resolves to a PersonProviderTrendingResponse object.
   */
  async getTrending(): Promise<PersonProviderTrendingResponse> {
    try {
      const trendingResults = await this.client.default.trendingPeople({
        timeWindow: 'week',
      });
      return Ok(
        trendingResults.results
          ?.filter((person) => is.truthy(person.id))
          .map((person) => person.id!) || [],
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Person not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch trending people'),
      );
    }
  }
}
