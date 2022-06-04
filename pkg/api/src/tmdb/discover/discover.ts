import { asApi } from '@zodios/core';

import { MovieAPI } from './movie/api';
import { TVAPI } from './tv/api';

export const DiscoverAPI = asApi([...TVAPI, ...MovieAPI] as const);
