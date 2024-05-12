import { ContainerBuilder } from 'diod';

import { IssueMapper } from './mapper';
import { IssueMongooseRepository } from './mongoose';
import { IssueRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(IssueMapper).asSingleton().addTag('mapper');
  builder
    .register(IssueRepository)
    .useClass(IssueMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
