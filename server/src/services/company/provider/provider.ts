import { Result } from 'oxide.ts';

import { ExceptionBase } from '@/infrastructure/exceptions/base';
import { CompanyProps } from '@/resources/company/types';

export type CompanyDetailsProviderResponse = Result<
  CompanyProps,
  ExceptionBase
>;
export abstract class CompanyDetailsProvider {
  abstract getDetails(id: number): Promise<CompanyDetailsProviderResponse>;
}
