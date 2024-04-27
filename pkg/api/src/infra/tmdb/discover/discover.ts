import { makeApi } from '@zodios/core';

import { MovieAPI } from './movie/api';
import { TVAPI } from './tv/api';

// eslint-disable-next-line import/prefer-default-export
export const DiscoverAPI = makeApi([...TVAPI, ...MovieAPI]);
