import { ContainerBuilder } from 'diod';

import archive from '@/resources/archive';
import cache from '@/resources/cache';
import discovery from '@/resources/discovery';
import downloader from '@/resources/downloader';
import filter from '@/resources/filter';
import imdb from '@/resources/imdb';
import issue from '@/resources/issue';
import mediaLibrary from '@/resources/media-library';
import mediaServer from '@/resources/media-server';
import movie from '@/resources/movie';
import notification from '@/resources/notification';
import profile from '@/resources/profile';
import request from '@/resources/request';
import review from '@/resources/review';
import settings from '@/resources/settings';
import show from '@/resources/show';
import user from '@/resources/user';

export default (builder: ContainerBuilder) => {
  archive(builder);
  cache(builder);
  discovery(builder);
  downloader(builder);
  filter(builder);
  imdb(builder);
  issue(builder);
  mediaLibrary(builder);
  mediaServer(builder);
  movie(builder);
  notification(builder);
  profile(builder);
  request(builder);
  review(builder);
  settings(builder);
  show(builder);
  user(builder);
};
