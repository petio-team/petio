import { Result } from 'oxide.ts';

import { ExceptionBase } from '@/infrastructure/exceptions/base';
import { NetworkProps } from '@/resources/network/types';

export type NetworkDetailsProviderResponse = Result<
  NetworkProps,
  ExceptionBase
>;
export abstract class NetworkDetailsProvider {
  abstract getDetails(id: number): Promise<NetworkDetailsProviderResponse>;
}
