import { Result } from 'oxide.ts';

import { ExceptionBase } from '@/infrastructure/exceptions/base';
import { PersonEntity } from '@/resources/person/entity';

export type PersonProviderDetailsResponse = Result<PersonEntity, ExceptionBase>;
export abstract class PersonDetailsProvider {
  abstract getDetails(id: number): Promise<PersonProviderDetailsResponse>;
}

export type PersonProviderTrendingResponse = Result<number[], ExceptionBase>;
export abstract class PersonTrendingProvider {
  abstract getTrending(): Promise<PersonProviderTrendingResponse>;
}
