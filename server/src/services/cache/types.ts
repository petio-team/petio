import { CompanyEntity } from '@/resources/company/entity';
import { CompanyProps } from '@/resources/company/types';
import { MovieEntity } from '@/resources/movie/entity';
import { MovieProps } from '@/resources/movie/types';
import { NetworkEntity } from '@/resources/network/entity';
import { NetworkProps } from '@/resources/network/types';
import { PersonEntity } from '@/resources/person/entity';
import { PersonProps } from '@/resources/person/types';
import { ShowEntity } from '@/resources/show/entity';
import { ShowProps } from '@/resources/show/types';

export type CommonResourcesCacheResponse = {
  movies: MovieProps[];
  shows: ShowProps[];
  people: PersonProps[];
  networks: NetworkProps[];
  companies: CompanyProps[];
  showDiscovery: ShowProps[];
  movieDiscovery: MovieProps[];
};

/**
 * Represents the response object for trending data.
 */
export type CommonResourcesResponse = {
  movies: MovieEntity[];
  shows: ShowEntity[];
  people: PersonEntity[];
  networks: NetworkEntity[];
  companies: CompanyEntity[];
  showDiscovery: ShowEntity[];
  movieDiscovery: MovieEntity[];
};
