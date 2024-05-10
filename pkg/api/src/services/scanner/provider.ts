import { MediaLibraryEntity } from '@/resources/media-library/entity';
import { UserEntity } from '@/resources/user/entity';

/**
 * Represents a scanner provider that performs various scans.
 */
export abstract class ScannerProvider {
  abstract getLibraries(): Promise<MediaLibraryEntity[]>;
  abstract getContent(): Promise<void>;
  abstract getUsers(): Promise<UserEntity[]>;
  abstract getWatchedHistory(): Promise<void>;
  abstract getWatchList(): Promise<void>;
}
