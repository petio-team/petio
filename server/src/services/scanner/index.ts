import { ContainerBuilder } from 'diod';

import { ScannerService } from '@/services/scanner/scanner-service';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ScannerService).asSingleton();
};
