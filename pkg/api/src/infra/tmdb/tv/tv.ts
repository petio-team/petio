import { makeApi } from '@zodios/core';

import { TvDetailsAPI } from './details/api';
import { VideosAPI } from './videos/api';

// eslint-disable-next-line import/prefer-default-export
export const TVAPI = makeApi([...TvDetailsAPI, ...VideosAPI]);
