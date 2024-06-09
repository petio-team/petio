import { Service } from 'diod';

import { FanartTvV3ApiClient } from '@/infrastructure/generated/fanart-api-client';
import { ServarrRadarrV1ApiClient } from '@/infrastructure/generated/servarr-radarr-api-client';
import { TheMovieDatabaseV3ApiClient } from '@/infrastructure/generated/tmdb-api-client';

@Service()
export class TheMovieDatabaseApiClient extends TheMovieDatabaseV3ApiClient {}

@Service()
export class FanartTvApiClient extends FanartTvV3ApiClient {}

@Service()
export class ServarrRadarrApiClient extends ServarrRadarrV1ApiClient {}
