import { ContainerBuilder } from 'diod';

import { CompanyMapper } from '@/resources/company/mapper';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(CompanyMapper).asSingleton();
};
