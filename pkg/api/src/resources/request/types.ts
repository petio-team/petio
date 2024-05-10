import { Override } from '@/infra/utils/override';

/**
 * Represents the type of a request.
 */
export enum RequestType {
  MOVIE = 'movie',
  TV = 'tv',
}

/**
 * Represents the status of a request.
 */
export enum RequestStatus {
  REQUESTED = 1,
  APPROVED = 2,
  PROCESSING = 3,
  FINIALISING = 4,
  COMPLETED = 5,
}

/**
 * Represents the pending status of a request.
 */
export type PendingFilter = {
  path: string;
  profile: string;
  tag: string;
};

/**
 * Represents the properties of a Request.
 */
export type RequestProps = {
  title: string;
  type: RequestType;
  thumbnail: string;
  status: RequestStatus;
  imdbId: string;
  tmdbId: string;
  tvdbId: string;
  seasons: Record<number, boolean>;
  approved: boolean;
  pending: Record<string, PendingFilter>;
  radarrs: string[];
  sonarrs: string[];
  users: string[];
  timestamp: Date;
};

/**
 * Represents the properties for creating a Request.
 */
export type CreateRequestProps = Override<
  RequestProps,
  {
    // TODO: add fields to override
  }
>;
