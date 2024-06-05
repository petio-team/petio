import { MediaLibraryEntity } from '@/resources/media-library/entity';
import { MovieEntity } from '@/resources/movie/entity';
import { ShowEntity } from '@/resources/show/entity';
import { UserEntity } from '@/resources/user/entity';

/**
 * Represents the possible result types for content.
 * It can be an array of `MovieEntity` or `ShowEntity`.
 */
export type ContentResultType = MovieEntity | ShowEntity;

/**
 * Represents a scanner provider that performs various scans.
 */
export abstract class ScannerProvider {
  abstract getLibraries(): Promise<MediaLibraryEntity[]>;
  abstract getLibraryContent<T = ContentResultType>(
    library: MediaLibraryEntity,
  ): Promise<T[]>;
  abstract getUsers(): Promise<UserEntity[]>;
  abstract getUsersWatchedHistory(): Promise<void>;
  abstract getUsersWatchList(): Promise<void>;
}
