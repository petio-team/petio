import { ContainerBuilder } from 'diod';

import { ScannerService } from '@/services/scanner/service';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ScannerService).asSingleton();
};
