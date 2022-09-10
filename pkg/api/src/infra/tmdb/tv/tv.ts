import { asApi } from '@zodios/core';

import { TvDetailsAPI } from './details/api';
import { VideosAPI } from './videos/api';

export const TVAPI = asApi([...TvDetailsAPI, ...VideosAPI]);
