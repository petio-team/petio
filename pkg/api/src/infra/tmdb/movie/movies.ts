import { asApi } from '@zodios/core';

import { MovieDetailsAPI } from './details/api';
import { VideosAPI } from './videos/api';

export const MovieAPI = asApi([...MovieDetailsAPI, ...VideosAPI]);
