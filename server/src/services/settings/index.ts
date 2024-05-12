import { ContainerBuilder } from 'diod';

import { SettingsService } from '@/services/settings/settings';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(SettingsService).asSingleton();
};
