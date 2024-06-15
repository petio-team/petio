import { Result } from 'oxide.ts';
import { SetRequired } from 'type-fest';

import { ExceptionBase } from '@/infrastructure/exceptions/base';
import { ShowProps, ShowSeasonProps } from '@/resources/show/types';

export type ShowProviderDetailsResponse = Result<ShowProps, ExceptionBase>;
export type ShowSeasonProviderDetailsResponse = Result<
  ShowSeasonProps,
  ExceptionBase
>;
export abstract class ShowProvider {
  abstract getDetails(id: number): Promise<ShowProviderDetailsResponse>;
}

export type ShowArtworkImages = SetRequired<ShowProps, 'artwork'>['artwork'] & {
  seasons?: {
    thumbnail?: {
      index: number;
      url: string;
    }[];
    banner?: {
      index: number;
      url: string;
    }[];
  };
};
export type ShowProviderArtworkImagesResponse = Result<
  ShowArtworkImages,
  ExceptionBase
>;
export abstract class ShowArtworkProvider {
  abstract getArtworkImages(
    id: number,
  ): Promise<ShowProviderArtworkImagesResponse>;
}

export type ShowProviderTrendingResponse = Result<number[], ExceptionBase>;
export abstract class ShowTrendingProvider {
  abstract getTrending(): Promise<ShowProviderTrendingResponse>;
}

export type ShowProviderDiscoverOptions = {
  page?: number;
  withNetworkId?: number;
};
export type ShowProviderDiscoverResponse = Result<number[], ExceptionBase>;
export abstract class ShowDiscoverProvider {
  abstract getDiscover(
    options?: ShowProviderDiscoverOptions,
  ): Promise<ShowProviderDiscoverResponse>;
}
