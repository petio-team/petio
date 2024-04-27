import { makeApi } from '@zodios/core';

import { MovieDetailsAPI } from './details/api';
import { VideosAPI } from './videos/api';

// eslint-disable-next-line import/prefer-default-export
export const MovieAPI = makeApi([...MovieDetailsAPI, ...VideosAPI]);
