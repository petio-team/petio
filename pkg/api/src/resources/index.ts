import { ContainerBuilder } from 'diod';

import mediaServer from './media-server';

export default (builder: ContainerBuilder) => {
  mediaServer(builder);
};
