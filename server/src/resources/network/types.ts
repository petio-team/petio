import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the properties of a Network.
 */
export type NetworkProps = {
  name: string;
  artwork: {
    logo?: {
      url: string;
      source: string;
    };
  };
  provider: {
    tmdbId: number;
  };
  source: string;
};

/**
 * Represents the properties for creating a Network.
 */
export type CreateNetworkProps = Override<
  NetworkProps,
  {
    // TODO: add fields to override
  }
>;
