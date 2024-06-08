import { ContainerBuilder } from 'diod';

import { CompanyService } from '@/services/company/company-service';
import { CompanyDetailsProvider } from '@/services/company/provider/provider';
import { CompanyTmdbProvider } from '@/services/company/provider/tmdb/tmdb';

export default (builder: ContainerBuilder) => {
  builder
    .register(CompanyDetailsProvider)
    .useClass(CompanyTmdbProvider)
    .asSingleton();
  builder.registerAndUse(CompanyService).asSingleton();
};
