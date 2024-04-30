import { ContainerBuilder } from 'diod';

import downloader from '@/resources/downloader';
import mediaServer from '@/resources/media-server';
import notification from '@/resources/notification';
import settings from '@/resources/settings';

export default (builder: ContainerBuilder) => {
  mediaServer(builder);
  notification(builder);
  settings(builder);
  downloader(builder);
};
