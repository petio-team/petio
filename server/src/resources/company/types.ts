import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the properties of a Company.
 */
export type CompanyProps = {
  name: string;
  artwork: {
    logo?: {
      url: string;
      source: string;
    };
  };
  providers: {
    tmdbId: number;
  };
  source: string;
};

/**
 * Represents the properties for creating a Company.
 */
export type CreateCompanyProps = Override<
  CompanyProps,
  {
    // TODO: add fields to override
  }
>;
