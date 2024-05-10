import { Override } from '@/utils/override';

/**
 * Represents the properties of a Archive.
 */
export type ArchiveProps = {
  type: string;
  title: string;
  thumb: string;
  imdb_id: string;
  tmdb_id: string;
  tvdb_id: string;
  users: string[];
  sonarrId: string[];
  radarrId: string[];
  approved: boolean;
  removed: boolean;
  removed_reason: string;
  complete: boolean;
  timeStamp: Date;
};

/**
 * Represents the properties for creating a Archive.
 */
export type CreateArchiveProps = Override<
  ArchiveProps,
  {
    // TODO: add fields to override
  }
>;
